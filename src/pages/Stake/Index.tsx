import { useState } from "react"
import {
  Container,
  Tabs,
  Tab,
  TabList,
  TabPanels,
  TabPanel
} from "@chakra-ui/react"
import { Validator } from "../../components/stake/Index"
import { PendingUnstake } from "../../components/pending/Index"
import { MyVoted } from "../../components/voted/Index"

export const Stake = () => {

  const [tabIndex, setTabIndex] = useState(0);

  const handleTabsChange = (index:any) => {
    console.log(index)
    setTabIndex(index);
  };

  return (
    <Container maxW='1060px' p={'0'}>
      <Tabs onChange={handleTabsChange}>
        <TabList>
          <Tab >Validator</Tab>
          <Tab>Pending Unstake</Tab>
          <Tab>My Voted validator</Tab>
        </TabList>

        <TabPanels>
          <TabPanel>
            <Validator keyIndex={tabIndex}  />
          </TabPanel>
          <TabPanel>
            <PendingUnstake keyIndex={tabIndex}  />
          </TabPanel>
          <TabPanel>
            <MyVoted keyIndex={tabIndex}  />
          </TabPanel>
        </TabPanels>
      </Tabs>
    </Container>
  )

}
