import { useState,useEffect } from "react"
import {
  ChakraProvider,
  Container,
  Box,
  theme,
  extendTheme
} from "@chakra-ui/react";

import './App.css';
import { useRoutes } from 'react-router-dom';
import routeConfig from './Routes';
import { useSafeAppsSDK } from '@safe-global/safe-apps-react-sdk';
import SafeAppsSDK, { SafeInfo } from '@safe-global/safe-apps-sdk';
import web3 from 'web3';
import { useSelector, useDispatch } from 'react-redux';
import { setBalanceInfo, setSafeInfo } from './store/SafeSlice';

import { NavBar } from "./components/global/Navbar/Index"

export const App = () => {
  const routes = useRoutes(routeConfig);
  const SDK = new SafeAppsSDK();
  const dispatch = useDispatch();

  useEffect(() => {
    const init = async () => {
      const safeInfo = await SDK.safe.getInfo();

      const safeBalances = await SDK.safe.experimental_getBalances({
        currency: 'usd',
      });

      dispatch(setSafeInfo({ safeInfo }));

      let tokenMap: any = {};

      safeBalances?.items?.forEach((item) => {
        if(item.tokenInfo.type === "NATIVE_TOKEN") {
          tokenMap['rei'] = {
            balance: item.balance
          }
          
        } else if(item.tokenInfo.type === "ERC20") {
          tokenMap[item.tokenInfo.address] = {
            balance: item.balance,
            ...item.tokenInfo
          }
        }
      })
      if(tokenMap['rei']?.balance) {
        let _balance = tokenMap['rei']?.balance || 0;
        let balanceWei  = Number(Number((web3.utils.fromWei(_balance, 'ether')).toString()).toFixed(2))
        dispatch(setBalanceInfo({ reiBalance: balanceWei, tokenMap }));
      }
    }
    init();
  },[])

  const theme1 = extendTheme({
    "colors": {
      "blue": {
        "500": "#6979f8",
      }
    }
  });

  
  return (
  <ChakraProvider theme={theme1}>
    <Container maxW='1060px' p={'0'}>
      <NavBar />
      <Box className="layout-main">{routes}</Box>
    </Container>
  </ChakraProvider>
  )
}
