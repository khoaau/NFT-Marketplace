// Packages
import { ethers } from 'ethers'
import axios from 'axios';

import React, { useEffect, useState } from 'react'
import { Container, Card, Row, Col } from 'react-bootstrap';
import { useParams } from 'react-router-dom';

// Constants
import { nftaddress, nftmarketaddress } from '../../constants/constants'

// Contracts
import NFT from '../../contracts/NFT.json'
import Market from '../../contracts/NFTMarket.json'

export default function Comments(tokenId){

    return(
        <p>{tokenId}</p>
    )
}