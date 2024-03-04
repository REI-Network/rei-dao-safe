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
  Flex,
  Spinner
} from '@chakra-ui/react';
import { useSafeAppsSDK } from '@safe-global/safe-apps-react-sdk';
import { ApolloClient, InMemoryCache } from '@apollo/client/core';
import { queryMaps } from '../../common/constants/graphql';
import { VALIDATORLISTURL, GRAPHQLURL } from '../../constants/Index';
import { ValidatorImage } from '../global/ValidatorImage';
import { STAKEMANAGERADDRESS } from '../../constants/Index';

import { useSelector } from 'react-redux';
import Web3 from 'web3';
import axios from 'axios';

interface Validator {
  id: string;
  validator: string;
  shares: string;
  date: string;
  timestamp: number;
  state: string;
  info: any;
}

type ValidatorList = Validator[];

const web3 = new Web3();

interface ValidatorProps {
  keyIndex: number;
}

export const PendingUnstake: React.FC<ValidatorProps> = ({ keyIndex }) => {
  const [dataList, setDataList] = useState<Validator[]>([]);
  const [loading, setLoading] = useState(false);

  const { safeInfo } = useSelector((state: any) => {
    return state?.safeSlice?.safeInfo || {};
  });

  const { tokenMap = {} } = useSelector((state: any) => {
    return state?.safeSlice?.balanceInfo;
  });

  const { sdk } = useSafeAppsSDK();
  const [safeTxGas, setSafeTxGas] = useState('210000');

  const params = {
    safeTxGas: +safeTxGas,
  };

  useEffect(() => {
    fetchData();
  }, [safeInfo?.safeAddress,keyIndex]);

  const dateFormat = (val: any, fmt: string) => {
    let date = new Date(val);
    var o: any = {
      'M+': date.getMonth() + 1, // 月份
      'd+': date.getDate(), // 日
      'h+': date.getHours(), // 小时
      'm+': date.getMinutes(), // 分
      's+': date.getSeconds(), // 秒
      'q+': Math.floor((date.getMonth() + 3) / 3), // 季度
      S: date.getMilliseconds(), // 毫秒
    };
    if (/(Y+)/.test(fmt))
      fmt = fmt.replace(
        RegExp.$1,
        (date.getFullYear() + '').substr(4 - RegExp.$1.length)
      );
    for (var k in o) {
      if (new RegExp('(' + k + ')').test(fmt))
        fmt = fmt.replace(
          RegExp.$1,
          RegExp.$1.length == 1
            ? o[k]
            : ('00' + o[k]).substr(('' + o[k]).length)
        );
    }
    return fmt;
  };

  const fetchData = async () => {
    let validatorMap: any = {};
    setLoading(true);
    try{

   
    const {
      data: { data: validatorInfo },
    } = await axios.get(VALIDATORLISTURL);

    for (let i = 0; i < validatorInfo.length; i++) {
      let _add = web3.utils.toChecksumAddress(validatorInfo[i].nodeAddress);
      validatorMap[_add] = validatorInfo[i];
    }

    const client = new ApolloClient({
      uri: GRAPHQLURL + '/chainMonitorEvent',
      cache: new InMemoryCache(),
    });
    const {
      data: { unStakeInfos },
    } = await client.query({
      query: queryMaps['unstakeList'],
      variables: {
        address: safeInfo?.safeAddress,
      },
    });
    let _validatorList = unStakeInfos;
    let validatorList: ValidatorList = [];
    for (let i = 0; i < _validatorList.length; i++) {
      let _info =
        validatorMap[
          web3.utils.toChecksumAddress(_validatorList[i].validator)
        ] || {};
      validatorList.push({
        id: _validatorList[i].id,
        validator: _validatorList[i].validator,
        shares: Number(
          web3.utils.fromWei(_validatorList[i].shares, 'ether').toString()
        ).toFixed(2),
        date: dateFormat(
          _validatorList[i].timestamp * 1000,
          'YYYY-MM-dd hh:mm:ss'
        ),
        timestamp: _validatorList[i].timestamp,
        state: _validatorList[i].state,
        info: _info,
      });
    }
    setLoading(false);

    setDataList(validatorList);
  }catch(e){
    setLoading(false);
    console.log(e)
  }
  };

  const checkState = (item: any) => {
    let now = Date.now();
    return item.timestamp * 1000 >= now || item.state == true;
  };
  const onsubmit = (item: any) => async () => {
    let res = await web3.eth.abi.encodeFunctionCall(
      {
        inputs: [
          {
            internalType: 'uint256',
            name: 'id',
            type: 'uint256',
          },
        ],
        name: 'unstake',
        outputs: [
          {
            internalType: 'uint256',
            name: 'amount',
            type: 'uint256',
          },
        ],
        stateMutability: 'nonpayable',
        type: 'function',
      },
      [item.id]
    );

    try {
      const txs = [
        {
          from: safeInfo?.safeAddress,
          to: STAKEMANAGERADDRESS,
          value: 0,
          data: res,
        },
      ];
      // Returns a hash to identify the Safe transaction
      // @ts-ignore
      const { safeTxHash } = await sdk.txs.send({ txs, params });
      console.log(safeTxHash);

      // @ts-ignore
      const safeTx = await sdk.txs.getBySafeTxHash(safeTxHash);
      console.log('safeTx', safeTx);
    } catch (err) {
      console.error(err);
    }
  };
  return (
    <>
      <Card size="lg" textAlign="left" bg="#FFF" color="#000" mt={6}>
        <CardBody p="1" width="100%">
          <TableContainer>
            <Table  colorScheme="blue">
              <Thead>
                <Tr>
                  <Th>Validator</Th>
                  <Th>Unstaked share</Th>
                  <Th>Available time</Th>
                  <Th>State</Th>
                  <Th>Operation</Th>
                </Tr>
              </Thead>
              <Tbody>
                { !loading && dataList.map((item: any, index) => (
                  <Tr key={index}>
                    <Td>
                      <Stack direction="row">
                        <ValidatorImage url={item.info?.logo}></ValidatorImage>
                        <Text fontSize="md">
                          {item.info.nodeName
                            ? item.info.nodeName
                            : item.validator}
                        </Text>
                      </Stack>
                    </Td>
                    <Td>{item.shares}</Td>
                    <Td>{item.date}</Td>
                    <Td>{item.state ? 'Retrieved' : 'Not retrieved'}</Td>
                    <Td>
                      <Button
                        className='btn'
                        colorScheme="blue"
                        size='sm'
                        isDisabled={checkState(item)}
                        onClick={onsubmit(item)}
                      >
                        Unstake
                      </Button>
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
    </>
  );
};
