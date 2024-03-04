import { useState } from 'react';
import { Box, Flex, Heading, Text } from '@chakra-ui/react';
import { useSelector } from 'react-redux';

export const NavBar = () => {
  //const [balance, setBalance] = useState(0);

  const balance = useSelector((state: any) => {
    return state?.safeSlice?.balanceInfo?.reiBalance;
  });

  return (
    <Box
      as="header"
      className="oa-basic-theme"
      display="flex"
      justifyContent="space-between"
      p="4"
      zIndex={20}
      w="full"
      height="82px"
      gap="3"
    >
      <Flex alignItems="center" gap="2">
        <Box p="2">
          <Heading size="xl">REI DAO</Heading>
        </Box>
      </Flex>
      <Flex alignItems="center" gap="2">
        <Text fontSize="sm" size="sm">
          REI Balance: {balance}
        </Text>
      </Flex>
    </Box>
  );
};
