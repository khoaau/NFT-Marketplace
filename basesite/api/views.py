import distutils.util
import json

from django.db import IntegrityError
from django.http import JsonResponse, HttpResponse
from django.shortcuts import render, get_object_or_404, get_list_or_404
from django.utils import timezone
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
from django.core import serializers

from .models import NFT, NFTMetadata, MarketPlaceInteraction, MarketPlaceComment

@csrf_exempt
@require_http_methods(["POST"])
def create_nft(request):
    request_body = json.loads(request.body)
    token_id = request_body['token_id']
    author_alias = request_body['author_alias']
    try:
        new_nft = NFT(
            token_id=token_id,
            author_alias=author_alias
        )
        new_nft.save()
        new_nft_metadata = NFTMetadata(
            nft=new_nft,
            created_date=timezone.now()
        )
        new_nft_metadata.save()
        response = serializers.serialize("json", [new_nft, new_nft_metadata])
        return HttpResponse(response)
    except IntegrityError:
        return raise_server_error("Duplicate token_ids is not permitted")



@csrf_exempt
@require_http_methods(["POST"])
def favorite_nft(request):
    request_body = json.loads(request.body)
    favorite_token_id = request_body['token_id']
    wallet_address = request_body['wallet_address']
    is_followed = bool(distutils.util.strtobool((request_body['is_followed'])))

    nft = get_object_or_404(NFT, token_id=favorite_token_id)
    nft_metadata = get_object_or_404(NFTMetadata, nft=nft.id)

    nft_metadata.favorites = nft_metadata.favorites + 1 if is_followed else max(0, nft_metadata.favorites - 1)
    nft_metadata.save()

    marketplace_interaction_query_set = MarketPlaceInteraction.objects.filter(
        nft__token_id=favorite_token_id,
        wallet_address=wallet_address
    )

    if marketplace_interaction_query_set.exists():
        marketplace_interaction = marketplace_interaction_query_set.get(nft=nft)
        marketplace_interaction.is_followed = is_followed
        marketplace_interaction.save()
        response = serializers.serialize("json", [marketplace_interaction])
        return HttpResponse(response)
    else:
        new_marketplace_interaction = MarketPlaceInteraction(
            nft=nft,
            wallet_address=wallet_address,
            is_followed=is_followed
        )
        new_marketplace_interaction.save()
        response = serializers.serialize("json", [new_marketplace_interaction])
        return HttpResponse(response)



@csrf_exempt
@require_http_methods(["POST"])
def post_comment(request):
    request_body = json.loads(request.body)
    token_id = request_body['token_id']
    comment = request_body['comment']
    author_alias = request_body['author_alias']
    author_address = request_body['author_address']

    nft = get_object_or_404(NFT, token_id=token_id)
    marketplace_comment = MarketPlaceComment(
        nft=nft,
        comment=comment,
        author_alias=author_alias,
        author_address=author_address
    )
    marketplace_comment.save()
    response = serializers.serialize("json", [marketplace_comment])
    return HttpResponse(response)



@csrf_exempt
@require_http_methods(["POST"])
def nft_details(request):
    request_body = json.loads(request.body)
    token_id = request_body['token_id']
    nft = get_object_or_404(NFT, token_id=token_id)
    nft_metadata = get_object_or_404(NFTMetadata, nft=nft)
    nft_metadata.nft_views = nft_metadata.nft_views + 1
    nft_metadata.save()
    response = serializers.serialize("json", [nft, nft_metadata])
    return HttpResponse(response)



@csrf_exempt
@require_http_methods(["GET"])
def get_wallet_favorites(request):
    request_body = json.loads(request.body)
    wallet_address = request_body['wallet_address']
    marketplace_interaction = NFT.objects.filter(
        marketplaceinteraction__wallet_address=wallet_address,
        marketplaceinteraction__is_followed=True
    ).values()
    response = json.dumps(list(marketplace_interaction))
    return HttpResponse(response)



@csrf_exempt
@require_http_methods(["POST"])
def get_comments(request):
    request_body = json.loads(request.body)
    token_id = request_body['token_id']
    marketplace_comments = MarketPlaceComment.objects.filter(
        nft__token_id=token_id
    ).values()
    response = json.dumps(list(marketplace_comments))
    return HttpResponse(response)



def raise_server_error(error_message):
    return JsonResponse({'Server Error': error_message}, status=500)
