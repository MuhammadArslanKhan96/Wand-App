import "./TreasuryDashboard.scss";

import { Box, Container, Grid, useMediaQuery, Zoom } from "@material-ui/core";
import { MetricCollection, Paper } from "@olympusdao/component-library";
import { memo, useEffect } from "react";
import { useWeb3Context } from "src/hooks/web3Context";
import { abi as wandaTestSticks } from "../../abi/testSticks.json";
import { addresses } from "../../constants";
import {
  MarketValueGraph,
  OHMStakedGraph,
  ProtocolOwnedLiquidityGraph,
  RiskFreeValueGraph,
  RunwayAvailableGraph,
  TotalValueDepositedGraph,
} from "./components/Graph/Graph";
import { BackingPerOHM, CircSupply, CurrentIndex, GOHMPrice, MarketCap, OHMPrice } from "./components/Metric/Metric";
import { ContractHelper } from "src/contractHelper";
const TreasuryDashboard = memo(() => {
  const isSmallScreen = useMediaQuery("(max-width: 650px)");
  const isVerySmallScreen = useMediaQuery("(max-width: 379px)");
  const { networkId } = useWeb3Context();

  const getStates = async () => {
    console.log("Check");
    const web3 = await ContractHelper(networkId);
    const sohm = new web3.eth.Contract(wandaTestSticks, "0x20bdbd171CED803C851DF09e33eff29d1d06F1A1");
    // addresses[networkId].WANDATEST
    const tvl = await sohm.methods.daysInCalculation().call();
    console.log(tvl);

    // const tvl = await sohm.methods.circulatingSupply().call();
    // const actualTVL = tvl.slice(0, -9) * 17;
    // setTVL(actualTVL);
  };

  useEffect(() => {
    getStates();
  });
  return (
    <div id="treasury-dashboard-view" className={`${isSmallScreen && "smaller"} ${isVerySmallScreen && "very-small"}`}>
      <Container
        style={{
          paddingLeft: isSmallScreen || isVerySmallScreen ? "0" : "3.3rem",
          paddingRight: isSmallScreen || isVerySmallScreen ? "0" : "3.3rem",
        }}
      >
        <Box className="hero-metrics">
          <Paper className="ohm-card">
            <MetricCollection>
              <MarketCap />
              <OHMPrice />
              <GOHMPrice />
              <CircSupply />
              <BackingPerOHM />
              <CurrentIndex />
            </MetricCollection>
          </Paper>
        </Box>

        <Zoom in={true}>
          <Grid container spacing={2} className="data-grid">
            <Grid item lg={6} md={6} sm={12} xs={12}>
              <Paper className="ohm-card ohm-chart-card">
                <TotalValueDepositedGraph />
              </Paper>
            </Grid>

            <Grid item lg={6} md={6} sm={12} xs={12}>
              <Paper className="ohm-card ohm-chart-card">
                <MarketValueGraph />
              </Paper>
            </Grid>

            <Grid item lg={6} md={6} sm={12} xs={12}>
              <Paper className="ohm-card ohm-chart-card">
                <RiskFreeValueGraph />
              </Paper>
            </Grid>

            <Grid item lg={6} md={6} sm={12} xs={12}>
              <Paper className="ohm-card ohm-chart-card">
                <ProtocolOwnedLiquidityGraph />
              </Paper>
            </Grid>

            {/*  Temporarily removed until correct data is in the graph */}
            {/* <Grid item lg={6} md={12} sm={12} xs={12}>
              <Paper className="ohm-card">
                <Chart
                  type="bar"
                  data={data}
                  dataKey={["holders"]}
                  headerText="Holders"
                  stroke={[theme.palette.text.secondary]}
                  headerSubText={`${data.length > 0 && data[0].holders}`}
                  bulletpointColors={bulletpoints.holder}
                  itemNames={tooltipItems.holder}
                  itemType={undefined}
                  infoTooltipMessage={tooltipInfoMessages().holder}
                  expandedGraphStrokeColor={theme.palette.graphStrokeColor}
                  scale={undefined}
                  color={undefined}
                  stroke={undefined}
                  dataFormat={undefined}
                  isPOL={undefined}
                  isStaked={undefined}
                />
              </Paper>
            </Grid> */}

            <Grid item lg={6} md={6} sm={12} xs={12}>
              <Paper className="ohm-card ohm-chart-card">
                <OHMStakedGraph />
              </Paper>
            </Grid>

            <Grid item lg={6} md={6} sm={12} xs={12}>
              <Paper className="ohm-card ohm-chart-card">
                <RunwayAvailableGraph />
              </Paper>
            </Grid>
          </Grid>
        </Zoom>
      </Container>
    </div>
  );
});

export default TreasuryDashboard;
