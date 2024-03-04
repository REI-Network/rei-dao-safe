import React, { useState } from 'react';
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
} from '@chakra-ui/react';
import { STAKEMANAGERADDRESS } from '../../constants/Index';
import { useSafeAppsSDK } from '@safe-global/safe-apps-react-sdk';

import { useSelector } from 'react-redux';
import Web3 from 'web3';

const web3 = new Web3();

export const StakeModal = (prop: any) => {
  const { isOpen, onClose, data } = prop;
  const [input, setInput] = useState('');
  const { reiBalance = 0, tokenMap = {} } = useSelector((state: any) => {
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

  const handleInputChange = (e: any) => {
    setInput(e.target.value);
  };
  const onsubmit = async () => {
    let res = await web3.eth.abi.encodeFunctionCall(
      {
        inputs: [
          {
            internalType: 'address',
            name: 'validator',
            type: 'address',
          },
          {
            internalType: 'address',
            name: 'to',
            type: 'address',
          },
        ],
        name: 'stake',
        outputs: [
          {
            internalType: 'uint256',
            name: 'shares',
            type: 'uint256',
          },
        ],
        stateMutability: 'payable',
        type: 'function',
      },
      [data.address, safeInfo?.safeAddress]
    );
    console.log(res)
    console.log(STAKEMANAGERADDRESS)
    console.log(input,web3.utils.numberToHex(web3.utils.toWei(input, 'ether')))

    try {
      const txs = [
        {
          to: STAKEMANAGERADDRESS,
          value: web3.utils.numberToHex(web3.utils.toWei(input, 'ether')),
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
    onClose();
  };
  const setAll = (token: string) => () => {
    let balance = tokenMap[token]?.balance;
    setInput(web3.utils.fromWei(balance, 'ether'));
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Stake Info</ModalHeader>
        <ModalCloseButton />
        <ModalBody pb={6}>
          <FormControl>
            <FormLabel>Validator</FormLabel>
            {data?.address}
          </FormControl>

          <FormControl mt={4}>
            <FormLabel>Amount</FormLabel>
            <InputGroup size="md">
              <Input
                pr="4.5rem"
                type="text"
                placeholder="Amount"
                value={input}
                onChange={handleInputChange}
              />
              <InputRightElement width="4.5rem">
                <Button h="1.75rem" size="sm" onClick={setAll('rei')}>
                  Max
                </Button>
              </InputRightElement>
            </InputGroup>
            <Text fontSize="xs">Balance:{reiBalance} REI</Text>
          </FormControl>
        </ModalBody>

        <ModalFooter>
          <Button colorScheme="blue" onClick={onsubmit} mr={3}>
            Save
          </Button>
          <Button onClick={onClose}>Cancel</Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};
