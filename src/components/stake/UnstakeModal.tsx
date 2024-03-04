import React, { useState, useEffect } from 'react';
import {
  Button,
  FormControl,
  FormLabel,
  Input,
  InputGroup,
  InputRightElement,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Text,
  useDisclosure,
} from '@chakra-ui/react';
import { STAKEMANAGERADDRESS } from '../../constants/Index';
import { useSafeAppsSDK } from '@safe-global/safe-apps-react-sdk';

import { useSelector } from 'react-redux';
import Web3 from 'web3';

const web3 = new Web3();

export const UnStakeModal = (prop: any) => {
  const { isOpen, onClose, data } = prop;
  const [inputUnstake, setInputUnstake] = useState('');
  const [currentItemBalance, setCurrentItemBalance] = useState(0);
  const [allownances, setAllownances] = useState(0);
  const {  tokenMap = {} } = useSelector((state: any) => {
    return state?.safeSlice?.balanceInfo;
  });
  const { safeInfo } = useSelector((state: any) => {
    return state?.safeSlice?.safeInfo || {};
  });

  const { sdk } = useSafeAppsSDK();
  const [safeTxGas, setSafeTxGas] = useState('210000');
  const params = {
    safeTxGas: +safeTxGas,
  };

  useEffect(() => {
    const init = async () => {
      let commissionAddress = web3.utils.toChecksumAddress(
        data.commissionAddress
      );
      if (!tokenMap[commissionAddress]) {
        setCurrentItemBalance(0);
      } else {
        let balanceWei = tokenMap[commissionAddress]?.balance;
        let _balance: any = web3.utils.fromWei(balanceWei, 'ether');

        setCurrentItemBalance(_balance);
      }
      console.log(currentItemBalance);

      let res = await web3.eth.abi.encodeFunctionCall(
        {
          inputs: [
            {
              internalType: 'address',
              name: 'owner',
              type: 'address',
            },
            {
              internalType: 'address',
              name: 'spender',
              type: 'address',
            },
          ],
          name: 'allowance',
          outputs: [
            {
              internalType: 'uint256',
              name: '',
              type: 'uint256',
            },
          ],
          stateMutability: 'view',
          type: 'function',
        },
        [safeInfo?.safeAddress, STAKEMANAGERADDRESS]
      );

      const txs: any = [
        {
          from: safeInfo?.safeAddress,
          to: data.commissionAddress,
          value: 0,
          data: res,
        },
      ];
      const allowance: any = await sdk.eth.call(txs);
      setAllownances(allowance);
    };
    if (isOpen) {
      setInputUnstake('');
      init();
    }
  }, [isOpen, tokenMap]);

  const handleInputUnstakeChange = (e: any) => {
    setInputUnstake(e.target.value);
  };
  const setAllCommision = () => {
    let commissionAddress = web3.utils.toChecksumAddress(
      data.commissionAddress
    );
    let balanceWei = tokenMap[commissionAddress]?.balance || 0;
    let _balance: any = balanceWei
      ? web3.utils.fromWei(balanceWei, 'ether')
      : 0;

    setInputUnstake(_balance);
  };
  // Unstake
  const onsubmitUnstake = async () => {
    let res = await web3.eth.abi.encodeFunctionCall(
      {
        inputs: [
          {
            internalType: 'address',
            name: 'validator',
            type: 'address',
          },
          {
            internalType: 'address payable',
            name: 'to',
            type: 'address',
          },
          {
            internalType: 'uint256',
            name: 'shares',
            type: 'uint256',
          },
        ],
        name: 'startUnstake',
        outputs: [
          {
            internalType: 'uint256',
            name: '',
            type: 'uint256',
          },
        ],
        stateMutability: 'nonpayable',
        type: 'function',
      },
      [
        data.address,
        safeInfo?.safeAddress,
        web3.utils.toWei(inputUnstake, 'ether'),
      ]
    );
    try {
      const txs = [
        {
          to: STAKEMANAGERADDRESS,
          value: 0,
          data: res,
        },
      ];

      console.log(params);
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
  const onApprove = async () => {
    let res = await web3.eth.abi.encodeFunctionCall(
      {
        inputs: [
          {
            internalType: 'address',
            name: 'spender',
            type: 'address',
          },
          {
            internalType: 'uint256',
            name: 'amount',
            type: 'uint256',
          },
        ],
        name: 'approve',
        outputs: [
          {
            internalType: 'bool',
            name: '',
            type: 'bool',
          },
        ],
        stateMutability: 'nonpayable',
        type: 'function',
      },
      [
        STAKEMANAGERADDRESS,
        '0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff',
      ]
    );

    try {
      const txs = [
        {
          to: data.commissionAddress,
          value: 0,
          data: res,
        },
      ];

      console.log(params);
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
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Unstake Info</ModalHeader>
        <ModalCloseButton />
        <ModalBody pb={6}>
          <FormControl>
            <FormLabel>Validator</FormLabel>
            {data.address}
          </FormControl>

          <FormControl mt={4}>
            <FormLabel>Amount</FormLabel>
            <InputGroup size="md">
              <Input
                pr="4.5rem"
                type="text"
                placeholder="Amount"
                value={inputUnstake}
                onChange={handleInputUnstakeChange}
              />
              <InputRightElement width="4.5rem">
                <Button h="1.75rem" size="sm" onClick={setAllCommision}>
                  Max
                </Button>
              </InputRightElement>
            </InputGroup>
            <Text fontSize="xs">
              Commission share balance:{currentItemBalance}
            </Text>
          </FormControl>
        </ModalBody>

        <ModalFooter>
          {allownances > 0 ? (
            <Button colorScheme="blue" onClick={onsubmitUnstake} mr={3}>
              Submit
            </Button>
          ) : (
            <Button colorScheme="blue" onClick={onApprove} mr={3}>
              {' '}
              Approve
            </Button>
          )}

          <Button onClick={onClose}>Cancel</Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};
