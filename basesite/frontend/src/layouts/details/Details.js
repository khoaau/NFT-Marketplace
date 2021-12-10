// Packages
import { ethers } from 'ethers'
import axios from 'axios';

import React, { useEffect, useState } from 'react'
import {Container, Card, Row, Col, Button, Form} from 'react-bootstrap';
import { useParams } from 'react-router-dom';
import "../../components/App.css"

// Constants
import { nftaddress, nftmarketaddress } from '../../constants/constants'

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faThumbsUp as regularThumbsUp, faThumbsDown as regularThumbsDown } from "@fortawesome/free-regular-svg-icons";
import { faThumbsUp as solidThumbsUp, faThumbsDown as solidThumbsDown, faCoins} from "@fortawesome/free-solid-svg-icons";

// Contracts
import NFT from '../../contracts/NFT.json'
import Market from '../../contracts/NFTMarket.json'
import Comments from "../../components/comments/comments";

export default function Details() {
  const { id } = useParams();
  const [nft, setNft] = useState(undefined);
  const [nftDetails, setNftDetails] = useState({});
  const [nftMetadata, setNftMetadata] = useState({});

  // Comments
    const [nftComments, setNftComments] = useState([]);
    const [commentBody, updateCommentBody] = useState('');
    const [upVoteIcon, setUpVoteIcon] = useState(regularThumbsUp);
    const [upVoteCount, setUpVoteCount] = useState(0);
    const [downVoteIcon, setDownVoteIcon] = useState(regularThumbsDown);
    const [downVoteCount, setDownVoteCount] = useState(0);

    const nft_token_id = `https://ipfs.infura.io/ipfs/${id}`
  useEffect(() => {
    // First, update the view count by 1, then
    // Grab the NFT details and metadata from the Django API server
    if (id) {
      // This section will be eventually used to increase the view counter of the nft when the page is visited
      // fetch('http://localhost:8000/api/create_nft/', {
      //   method: 'POST',
      //   headers: {
      //     Accept: 'application/json',
      //     'Content-Type': 'application/json'
      //   },
      //   body: JSON.stringify({
      //     'token_id': 'https://ipfs.infura.io/ipfs/' + id,
      //     'author_alias': 'test'
      //   })
      // }).then((response) => response.json())
      //   .then((json) => {
      //     console.log(json);
      //   })
      //   .catch((error) => {
      //     console.error(error);
      //   });
        
      fetch('http://localhost:8000/api/nft_details/', {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          'token_id': nft_token_id,
        })
      }).then((response) => response.json())
        .then((result) => {
          const nft_details = result && result.length > 0 && result[0].fields;
          const nft_metadata = result && result.length > 1 && result[1].fields;

          setNftDetails(nft_details);
          setNftMetadata(nft_metadata);
        })
        .catch((error) => {
          console.error(error);
        });
        //Comments
        fetchComments();
    }
    loadNFTs();
  }, [id]);

  async function loadNFTs() {
    // Get the current market NFTs
    const provider = new ethers.providers.JsonRpcProvider();
    const tokenContract = new ethers.Contract(nftaddress, NFT.abi, provider);
    const marketContract = new ethers.Contract(nftmarketaddress, Market.abi, provider);
    const data = await marketContract.fetchMarketItems();

    // Fetch and format the marketplace NFTs to an object with its attributes
    const nfts = await Promise.all(data.map(async (i) => {
      const tokenUri = await tokenContract.tokenURI(i.tokenId);
      const meta = await axios.get(tokenUri);
      const price = ethers.utils.formatUnits(i.price.toString(), 'ether');

      return {
        price,
        tokenId: i.tokenId.toNumber(),
        tokenUri: tokenUri,
        seller: i.seller,
        owner: i.owner,
        image: meta.data.image,
        name: meta.data.name,
        description: meta.data.description,
      }
    }));

    // This is used to compare against the Django NFT API token_id
    const tokenUri = 'https://ipfs.infura.io/ipfs/' + id;

    // Find the correct marketplace NFT given the token URI
    const nft = nfts.filter((nft) => nft.tokenUri === tokenUri);
    if (nft && nft.length > 0) setNft(nft[0]);
  }

  function upVoteComment(e, comment) {
      if (!e) var e = window.event;
      e.cancelBubble = true;
      if (e.stopPropagation) {
          e.stopPropagation();
      }

      if(upVoteIcon === regularThumbsUp) {
          setUpVoteIcon(solidThumbsUp);
          setUpVoteCount(upVoteCount + 1);
          if(downVoteIcon === solidThumbsDown){
              setDownVoteCount(downVoteCount - 1);
              setDownVoteIcon(regularThumbsDown);
          }
      }
      else {
          setUpVoteIcon(regularThumbsUp);
          setUpVoteCount(upVoteCount - 1);
      }
  }

    function downVoteComment(e, comment) {
        if (!e) var e = window.event;
        e.cancelBubble = true;
        if (e.stopPropagation) {
            e.stopPropagation();
        }

        if(downVoteIcon === regularThumbsDown) {
            setDownVoteIcon(solidThumbsDown);
            setDownVoteCount(downVoteCount + 1);
            if(upVoteIcon === solidThumbsUp){
                setUpVoteCount(upVoteCount - 1);
                setUpVoteIcon(regularThumbsUp);
            }
        }
        else {
            setDownVoteIcon(regularThumbsDown);
            setDownVoteCount(downVoteCount - 1);
        }
    }

  // Comments feature code
    // will separate it after fix the bug
  function Comments(){

      return(
          <React.Fragment>
              <h3>Comments</h3>
              { !nftComments.length && <p>No comment yet.</p> }

              {nftComments.map((nftComment, i) =>
                  <div key={i} className={"comment-section"}>
                      <h4 style={{color:"blue"}}>{nftComment.author_alias}</h4>
                      <hr/>
                      <p>{nftComment.comment}</p>
                      <div className={"reaction-div"}>
                        <div>
                            <FontAwesomeIcon icon={upVoteIcon}
                                             onClick={(e) => upVoteComment(e, nftComment)} title="UpVote"/>
                            {nftComment.up_votes}
                        </div>
                          <div>
                              <FontAwesomeIcon icon={downVoteIcon}
                                               onClick={(e) => downVoteComment(e, nftComment)} title="DownVote"/>
                              {nftComment.down_votes}
                          </div>
                          <div>
                              <FontAwesomeIcon icon={faCoins}/>
                              {nftComment.tips}
                          </div>
                      </div>
                  </div>
              )}

              {postSection()}

          </React.Fragment>
      )
  }

  function fetchComments(){
      fetch('http://localhost:8000/api/get_comments/', {
          method: "POST",
          body: JSON.stringify({
              "token_id": nft_token_id,
          })
      }).then((response) => response.json())
          .then((json) => {
              setNftComments(json);
          })
  }

  function postSection(){
      return(
              <Form>
                  <Form.Group controlId="formCommentBody" >
                      <Form.Control as="textarea" rows={4} value={commentBody}
                                    placeholder="Type comment"
                                    onChange={e => updateCommentBody(e.target.value)} />
                  </Form.Group>
                  <Button variant="primary" type={"submit"}
                          style={{float: 'right' }}
                          onClick={(e) => postComment(e)}>
                      Post
                  </Button>
              </Form>
      )
  }
  function postComment(e){
      e.preventDefault();
      const { comment } = commentBody;
      console.log("Comment Body: " + comment);

      fetch('http://localhost:8000/api/get_comments/', {
          method: "POST",
          body: JSON.stringify({
              "token_id": nft_token_id,
              "comment": comment,
              "author_alias": nftDetails.author_alias,
              "author_address": nftDetails.author_address,
          })
      }).then((response) => response.json())
          .then((json) => {
              console.log(json);
          })
          .catch((error) => {
              console.error(error);
          });
  }

  return (
    <React.Fragment>
      {nft && (
        <Container>
          <Row className="justify-content-center" >
            {/* This will contain the details of the nft */}
            <Card border="dark" style={{ width: '50vw' }} className="my-3">
              <Card.Img variant="top" src={nft.image} style={{ height: '100%', width: '100%', paddingTop: '1rem', objectFit: 'cover' }} />
              <Card.Body>
                <Card.Title as="h2" className="text-center py-1" >{nft.name}</Card.Title>
                <Card.Text>
                  <Row>
                    <Col sm={4} md={3} lg={2}><strong>Description</strong></Col>
                    <Col>{nft.description}</Col>
                  </Row>
                  <Row>
                    <Col sm={4} md={3} lg={2}><strong>Author</strong></Col>
                    <Col>{nftDetails.author_alias}</Col>
                  </Row>
                  <Row>
                    <Col sm={4} md={3} lg={2}><strong>Created</strong></Col>
                    <Col>{nftMetadata.created_date}</Col>
                    <Col md={1} lg={1}>Favourites: {nftMetadata.favorites}</Col>
                    <Col md={1} lg={1}>Views: {nftMetadata.nft_views}</Col>
                  </Row>
                </Card.Text>
              </Card.Body>
            </Card>
          </Row>
          <Row>
            {/* This will contain the comments */}
              {/* render bug*/}
              {/*<Comments tokenId={nft_token_id}/>*/}
                <Comments/>
          </Row>
        </Container>
      )}
      </React.Fragment>
  );
}