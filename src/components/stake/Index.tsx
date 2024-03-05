import { useState, useEffect } from 'react';
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
  useDisclosure,
  Flex,
  Spinner,
  Box
} from '@chakra-ui/react';
import { ApolloClient, InMemoryCache } from '@apollo/client/core';


import { useSafeAppsSDK } from '@safe-global/safe-apps-react-sdk';
import { queryMaps } from '../../common/constants/graphql';
import Web3 from 'web3';
import axios from 'axios';

import { addr } from '../../utils';
import { ValidatorImage } from '../global/ValidatorImage';
import  { StakeModal } from './StakeModal';
import { UnStakeModal } from './UnstakeModal';
import { VALIDATORLISTURL, GRAPHQLURL } from '../../constants/Index';


const web3 = new Web3();

interface ValidatorProps {
  keyIndex: number;
}

export const Validator: React.FC<ValidatorProps> = ({ keyIndex }) => {
  const { sdk } = useSafeAppsSDK();

  let number: any = '';

  const [dataList, setDataList] = useState([]);
  const [loading, setLoading] = useState(false);

  const { isOpen, onOpen, onClose } = useDisclosure();
  const { isOpen:isOpenUnstake, onOpen:onOpenUnstake, onClose:onCloseUnstake } = useDisclosure()
  const [selectItem, setSelectItem] = useState({});

  const fetchData = async () => {
    setLoading(true);
    const response = await sdk.eth.getBlockByNumber(['latest']);
    number = response.number;
    let validatorMap: any = {};
    const {
      data: { data: validatorInfo },
    } = await axios.get(VALIDATORLISTURL);

    for (let i = 0; i < validatorInfo.length; i++) {
      let _add = web3.utils.toChecksumAddress(validatorInfo[i].nodeAddress);
      validatorMap[_add] = validatorInfo[i];
    }

    const client = new ApolloClient({
      uri: GRAPHQLURL+'/chainMonitorBlock',
      cache: new InMemoryCache(),
    });

    const {
      data: { validators },
    } = await client.query({
      query: queryMaps['validator'],
      variables: {
        blockHeight: (Number(number) - 5).toString(),
      },
      fetchPolicy: 'cache-first',
    });
    setLoading(false);
    let _validatorList = validators[0]?.Validator;
    let validatorList: any = [];
    for (let i = 0; i < _validatorList?.length; i++) {
      let _info =
        validatorMap[web3.utils.toChecksumAddress(_validatorList[i]?.address)] ||
        {};
      validatorList.push({
        address: _validatorList[i].address,
        votingPower: Number(
          web3.utils.fromWei(_validatorList[i]?.votingPower, 'ether').toString()
        ).toFixed(2),
        active: _validatorList[i].active,
        commissionAddress: _validatorList[i]?.commissionAddress,
        info: _info,
      });
    }

    setDataList(validatorList);
  };

  useEffect(() => {
    fetchData();
  }, [keyIndex]);
  
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
    <Card  size="lg" textAlign='left' bg='#FFF' color='#000' mt={6}>
      <CardBody p="1" width="100%">
        <TableContainer>
          <Table colorScheme="blue">
            <Thead>
              <Tr>
                <Th>Validator</Th>
                <Th>Voting Power</Th>
                <Th>Operation</Th>
              </Tr>
            </Thead>
            <Tbody>
              {!loading&&dataList.map((item: any, index) => (
                <Tr key={index}>
                  <Td>
                    <Stack direction="row">
                      <ValidatorImage url={item.info?.logo}></ValidatorImage>
                      <Text fontSize="md">
                        {item.info.nodeName
                          ? item.info.nodeName
                          : addr(item.address)}
                      </Text>
                      {item.active ? (
                      <Box as="span"  fontSize="xs" className='activeText'>
                        Active
                      </Box>) : <Box as="span" fontSize="xs" className='inactiveText'>
                        InActive
                      </Box>}
                      
                    </Stack>
                  </Td>
                  <Td>{item.votingPower}</Td>
                  <Td>
                    <Stack direction="row" spacing={4} align="center">
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
