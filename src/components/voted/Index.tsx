import { useState, useEffect,useMemo } from 'react';
import {
  Card,
  CardBody,
  TableContainer,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Stack,
  Text,
  Button,
  Flex,
  Spinner,
  useDisclosure
} from '@chakra-ui/react';
import { useSafeAppsSDK } from '@safe-global/safe-apps-react-sdk';
import { SafeAppProvider } from '@safe-global/safe-apps-provider';
import { ApolloClient, InMemoryCache } from '@apollo/client/core';
import { queryMaps } from '../../common/constants/graphql';
import { VALIDATORLISTURL, GRAPHQLURL } from '../../constants/Index';
import { ValidatorImage } from '../global/ValidatorImage';
import { STAKEMANAGERADDRESS, REIRPCURL } from '../../constants/Index';
import abiStakeManager from '../../common/abis/abiStakeManager';
import abiCommissionShare from '../../common/abis/abiCommissionShare';
import { addr } from '../../utils';

import { StakeModal } from '../stake/StakeModal';
import { UnStakeModal } from '../stake/UnstakeModal';

import { useSelector } from 'react-redux';
import Web3 from 'web3';
import axios from 'axios';

interface VotedValidator {
  address: string;
  power: string;
  balanceOfShare: string;
  balanceOfShareValue: string;
  commissionShare: string;
  commissionAddress: string;
  info: any;
}

type VotedValidatorList = VotedValidator[];

const web3 = new Web3(REIRPCURL);

interface ValidatorProps {
  keyIndex: number;
}

export const MyVoted: React.FC<ValidatorProps> = ({ keyIndex }) => {
  const [dataList, setDataList] = useState<VotedValidator[]>([]);
  const [loading, setLoading] = useState(false);

  const { sdk,  safe } = useSafeAppsSDK();

  const { isOpen, onOpen, onClose } = useDisclosure();
  const { isOpen:isOpenUnstake, onOpen:onOpenUnstake, onClose:onCloseUnstake } = useDisclosure()
  const [selectItem, setSelectItem] = useState({});

  const web3Provider = useMemo(() => new Web3(new SafeAppProvider(safe, sdk)), [sdk, safe]);

  //web3.setProvider(web3Provider)

  const { safeInfo } = useSelector((state: any) => {
    return state?.safeSlice?.safeInfo || {};
  });

  const { tokenMap = {} } = useSelector((state: any) => {
    return state?.safeSlice?.balanceInfo;
  });

  const [safeTxGas, setSafeTxGas] = useState('210000');

  const params = {
    safeTxGas: +safeTxGas,
  };

  useEffect(() => {
    fetchData();
  }, [safeInfo?.safeAddress,keyIndex]);

  const getBalanceOfShare = async (activeValidatorsShare:any) => {
    let commissionShare = new web3.eth.Contract(abiCommissionShare, activeValidatorsShare);
    //const contract = useMemo(() => new web3.eth.Contract(contractABI, contractAddress), [web3Provider, contractABI, contractAddress]);
    let balance = 0;
    if (safeInfo?.safeAddress) {
      balance = await commissionShare.methods.balanceOf(safeInfo?.safeAddress).call();
    }
    return {
      balance,
      commissionShare
    };
  }

  const fetchData = async () => {
    const chainInfo = await sdk.safe.getChainInfo();
    setLoading(true);
    const stakeManageInstance = new web3.eth.Contract(abiStakeManager, STAKEMANAGERADDRESS);
    let validatorMap:any = {};
    const {data: {data: validatorInfo}} = await axios.get(VALIDATORLISTURL)
    for(let i = 0; i < validatorInfo.length; i++) {
      let _add = web3.utils.toChecksumAddress(validatorInfo[i].nodeAddress);
      validatorMap[_add] = validatorInfo[i];
    }

    const client = new ApolloClient({
      uri: GRAPHQLURL+'/chainMonitorEvent',
      cache: new InMemoryCache(),
    });
    const {
      data: { stakeInfos }
    } = await client.query({
      query: queryMaps['mystakeList'],
      variables: {
        address: safeInfo?.safeAddress
      },
      fetchPolicy: 'cache-first'
    });
    let myStakeList = stakeInfos;

    if (myStakeList.length > 0) {
      let validatorPowerMap = myStakeList.map((item:any) => {
        return stakeManageInstance.methods.getVotingPowerByAddress(item.validator).call();
      });
      let validatorsMap = myStakeList.map((item:any) => {
        return stakeManageInstance.methods.validators(item.validator).call();
      });

      let validatorPower = await Promise.all(validatorPowerMap);
      let validators = await Promise.all(validatorsMap);

      let balanceOfShareMap = validators.map((item:any) => {
        return getBalanceOfShare(item[1]);
      });
      let balanceOfShare = await Promise.all(balanceOfShareMap);
      let arr = [];
      for (let i = 0; i < myStakeList.length; i++) {



        arr.push({
          address: myStakeList[i].validator,
          power: web3.utils.fromWei(validatorPower[i],'ether'),
          balanceOfShare: web3.utils.fromWei(balanceOfShare[i].balance, 'ether'),
          balanceOfShareValue: Number(web3.utils.fromWei(balanceOfShare[i].balance, 'ether').toString()).toFixed(2),
          commissionShare: balanceOfShare[i].commissionShare,
          commissionAddress: validators[i][1],
        });
      }
      myStakeList = arr;

      let validatorList = [];
      for(let i = 0; i < myStakeList.length; i++) {
        let _info = validatorMap[web3.utils.toChecksumAddress(myStakeList[i].address)] || {} 
        validatorList.push({
          ...myStakeList[i],
          info: _info
        })
      }
    
      setDataList(validatorList);
      setLoading(false);

    }
  };
  const openStake = (item: any) => {
    onOpen();
    setSelectItem(item)
  }

  const openUnStake = (item: any) => {
    onOpenUnstake();
    setSelectItem(item)
  }
  
  return (
    <>
      <Card size="lg" textAlign="left" bg="#FFF" color="#000" mt={6}>
        <CardBody p="1" width="100%">
          <TableContainer>
          <Table colorScheme="blue">
            <Thead>
              <Tr>
                <Th>Validator</Th>
                <Th>Commission Share Balance</Th>
                <Th>Operation</Th>
              </Tr>
            </Thead>
            <Tbody>
              {!loading&&dataList.map((item, index) => (
                <Tr key={index}>
                  <Td>
                    <Stack direction='row'>
                      <ValidatorImage url={item.info?.logo}></ValidatorImage>
                      <Text fontSize='md'>{item.info.nodeName?item.info.nodeName:addr(item?.address)}</Text>
                      
                    </Stack>
                  </Td>
                  <Td>{item.balanceOfShareValue}</Td>
                  <Td>
                    <Stack direction='row' spacing={4} align='center'>
                      <Button colorScheme='blue' className='btn' onClick={() => openStake(item)} size='sm' >Stake</Button>
                      <Button colorScheme='blue' className='btn' onClick={() => openUnStake(item)}  size='sm' >Start Unstake</Button>
                    </Stack>
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
          </TableContainer>
          {
          loading && (<Flex justifyContent='center' width='100%' my="5"><Spinner /></Flex>)
        }
        </CardBody>
      </Card>
      <StakeModal isOpen={isOpen} onClose={onClose} data={selectItem} />
      <UnStakeModal isOpen={isOpenUnstake} onClose={onCloseUnstake} data={selectItem} />
    </>
  );
};
