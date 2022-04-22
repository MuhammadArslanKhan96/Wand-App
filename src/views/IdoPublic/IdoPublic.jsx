import "./IdoPublic.scss";

import { Paper } from "@olympusdao/component-library";
import { ethers } from "ethers";
import { child, get, ref, set } from "firebase/database";
import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import BUSD_ABI from "src/abi/BUSD.json";
import { database } from "src/config";
import { addresses } from "src/constants";
import { Account, ContractHelper } from "src/contractHelper";
import { useWeb3Context } from "src/hooks/web3Context";
import { error, info } from "src/slices/MessagesSlice";
import Web3 from "web3";

function IdoPublic() {
  const { networkId, provider } = useWeb3Context();
  const dispatch = useDispatch();

  const [values, setValues] = useState({
    userBUSD: undefined,
    busd: undefined,
    loading: true,
    data: undefined,
    account: undefined,
    isPublic: false,
    isTransferingBUSD: false,
  });
  const [countdown, setcCunydown] = useState({
    days: undefined,
    hours: undefined,
    minutes: undefined,
    seconds: undefined,
    expire: false,
  });
  const getAccount = async () => {
    const account = await Account();
    getUserData(account);
  };

  const getUserData = async account => {
    //Get user BUSD balance
    try {
      const web3 = await ContractHelper(networkId);
      const busdContract = new web3.eth.Contract(BUSD_ABI, addresses[networkId].BUSD);
      let busdBalance = await busdContract.methods.balanceOf(account[0]).call();
      busdBalance = Web3.utils.fromWei(busdBalance, "ether");

      const dbRef = ref(database);
      get(child(dbRef, `public-users/${account[0]}`))
        .then(snapshot => {
          if (snapshot.exists()) {
            setValues({
              ...values,
              userBUSD: busdBalance,
              data: snapshot.val(),
              account: account[0],
              loading: false,
              isPublic: true,
            });
            return snapshot.val();
          } else {
            setValues({ ...values, loading: false, isPublic: false, userBUSD: busdBalance, account: account[0] });
            console.log("No data available");
          }
        })
        .catch(error => {
          console.error(error);
        });
    } catch (err) {
      console.error(err);
    }
  };

  const buyOPI = async () => {
    setValues({ ...values, isTransferingBUSD: true });
    const { busd, account, data } = values;
    try {
      const signer = provider.getSigner();
      const busdContract = new ethers.Contract(addresses[networkId].BUSD, BUSD_ABI, signer);
      const tx = await busdContract.transfer(
        "0x9bcD4d988917AF02aa395856A5aaa70842DEce56", // our treasury address where all BUSD will go
        Web3.utils.toWei(busd, "ether"),
      );
      const txResponse = await tx.wait();
      console.log(account);
      //Store Data in DB
      set(ref(database, `public-users/${account}`), {
        address: account,
        busd: Number(data?.busd) > 0 ? Number(data?.busd) + Number(busd) : Number(busd),
        claimedBusd: 0,
      });
      getUserData([account]);
      dispatch(
        info(
          `Successfully bought OPI token!, see your transaction at https://testnet.bscscan.com/tx/${txResponse?.transactionHash}`,
        ),
      );
    } catch (err) {
      console.error(err);
      dispatch(error(err?.data?.message));
    } finally {
      setValues({ ...values, isTransferingBUSD: false });
    }
  };

  useEffect(() => {
    getAccount();

    const countDownDate = new Date(Date.UTC(2022, 3, 17, 11, 0, 0)).getTime();
    const x = setInterval(function () {
      // Get today's date and time
      const now_utc = new Date();
      // Find the distance between now and the count down date
      const distance = countDownDate - now_utc;

      // Time calculations for days, hours, minutes and seconds
      const days = Math.floor(distance / (1000 * 60 * 60 * 24));
      const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((distance % (1000 * 60)) / 1000);

      setcCunydown({
        ...countdown,
        days,
        hours,
        minutes,
        seconds,
        expire: true,
      });

      // If the count down is over, write some text
      if (distance < 0) {
        clearInterval(x);
        setcCunydown({
          ...countdown,
          days: "00",
          hours: "00",
          minutes: "00",
          seconds: "00",
          expire: false,
        });
      }
    }, 1000);
  }, []);
  const { days, hours, minutes, seconds, expire } = countdown;

  return (
    <div id="public-view">
      <Paper>
        <div className="public-ido-area">
          {values.loading ? (
            <div className="text-center">
              <h6>
                Loading...
                <br></br>
                <br></br>
                <i>Note: Metamask should be logged or not if you can see this message long time than expected.</i>
              </h6>
            </div>
          ) : (
            <div class="board-top-bar mx-auto p-3 pr-0 ">
              <a href="#" class="nav-link text-primary mb-3">
                PUBLIC IDO
              </a>
              <div class="row top-board">
                <div class="col-4">
                  <div class="item text-center">
                    <h6>Price</h6>
                    <h4>20 USD</h4>
                  </div>
                </div>
                <div class="col-4">
                  <div class="item text-center">
                    <h6>Phase</h6>
                    <h4>{expire ? "Open" : "Sales Done"} </h4>
                  </div>
                </div>
                <div class="col-4">
                  <div class="item text-center">
                    <h6>Time left</h6>
                    <h4>
                      {countdown.days == undefined ? (
                        <div className="text-center">
                          <h6>Loading...</h6>
                        </div>
                      ) : (
                        <div>{`${days}d ${hours}h ${minutes}m ${seconds}s`}</div>
                      )}
                    </h4>
                  </div>
                </div>
              </div>
              <div class="card-box1 w-50 mx-auto d-flex justify-content-center align-content-center flex-column">
                <div class="row w-100 py-3">
                  <div class="col-6 text-center">
                    <a href="/ido-whitelist" className="Whitelist_link">
                      Whitelist
                    </a>
                  </div>
                  <div class="col-6 text-center">
                    <a href="/ido-public" className="act">
                      Public
                    </a>
                  </div>
                </div>
                <a
                  style={values.data?.address !== values.account ? { pointerEvents: "none" } : void 0}
                  href={expire && "#"}
                  className="btn btn-primary w-100 white-btn"
                  id="whitelist_notice_box"
                >
                  {!expire ? "You're not Whitelisted" : "Welcome public Sales"}
                  {/* "Hi Opies!, We are appreciated of for joining, Stay tuned for our next awesome master piece." */}
                </a>
                {expire && (
                  <div class="button-box text-center">
                    <p class="text-left amount-text">Amount to Purchase</p>
                    <div class="d-flex justify-content-between align-content-center pt-1">
                      <div class="input-group mb-3">
                        <input
                          placeholder="Enter BUSD Amount"
                          value={values.busd}
                          onChange={e => setValues({ ...values, busd: e.target.value })}
                          type="text"
                          className="btn input btn-primary busd-btn left-radius"
                        />
                        <button
                          disabled={values.isTransferingBUSD}
                          onClick={buyOPI}
                          className="btn btn-primary Buy-btn right-radius"
                        >
                          Buy OPI
                        </button>
                      </div>
                    </div>

                    <div class="pt-1 pb-3">
                      <a href="#" class="btn btn-primary w-100 expect-btn d-flex justify-content-between">
                        <p>Expected Your OPI Balance</p>
                        <span>{Number(values.busd / 20).toFixed(4) || 0} OPI</span>
                      </a>
                    </div>
                  </div>
                )}
              </div>
              {expire && (
                <div>
                  <div class="table-box1 text-center px-3 pb-5">
                    <div class="row text-left px-3 pb-0 table-box-bg">
                      <div className="col-12 p-0">
                        <p className="p-3 border-bottom">Current Investment Balance</p>
                      </div>
                      <div className="col-6 p-0">
                        <p className="p-3 border-bottom border-right">Busd Balance</p>
                      </div>
                      <div className="col-6 p-0 text-right">
                        <p className="p-3 border-bottom">{Number(values.userBUSD).toFixed(4) || 0} Busd</p>
                      </div>
                      <div className="col-6 p-0">
                        <p className="p-3 border-bottom border-right">Deposited Balance</p>
                      </div>
                      <div className="col-6 p-0 text-right">
                        <p className="p-3 border-bottom">{/*{Number(values.data?.busd).toFixed(4)}*/}0 Busd</p>
                      </div>
                      <div className="col-6 p-0">
                        <p className="p-3">Requested OPI</p>
                      </div>
                      <div className="col-6 p-0 text-right">
                        <p className="p-3">{/*{Number(values.data?.busd / 16).toFixed(9) || 0.0}*/}0 OPI</p>
                      </div>
                    </div>
                    {/*<a href="#" class="btn btn-primary w-50 my-3 tbl-btn">*/}
                    {/*  Claim*/}
                    {/*</a>*/}
                  </div>
                  <div className="table-box1 text-center px-3 pb-5">
                    <div className="row text-left px-3 pb-0 table-box-bg">
                      <div className="col-12 p-0">
                        <p className="p-3 border-bottom">Investment Balance-Batch1</p>
                      </div>
                      <div className="col-6 p-0">
                        <p className="p-3 border-bottom border-right">Deposited Balance</p>
                      </div>
                      <div className="col-6 p-0 text-right">
                        <p className="p-3 border-bottom">
                          {/*{Number(values.data?.busd).toFixed(4)}*/}
                          15 Busd
                        </p>
                      </div>
                      <div className="col-6 p-0">
                        <p className="p-3">Requested OPI</p>
                      </div>
                      <div className="col-6 p-0 text-right">
                        <p className="p-3">{/*{Number(values.data?.busd / 16).toFixed(9) || 0.0} */}1 OPI</p>
                      </div>
                    </div>
                    {/*<a href="#" className="btn btn-primary w-50 my-3 tbl-btn">*/}
                    {/*  Claim*/}
                    {/*</a>*/}
                  </div>

                  {/*<div class="table-box p-4 text-center">*/}
                  {/*  <div class="row text-left table-box-bg">*/}
                  {/*    <div class="col-6 p-0">*/}
                  {/*      <p class="p-3 border-bottom border-right">Claimed Balance</p>*/}
                  {/*    </div>*/}
                  {/*    <div class="col-6 p-0 text-right">*/}
                  {/*      <p class="p-3 border-bottom">0.0 OPI</p>*/}
                  {/*    </div>*/}
                  {/*    <div class="col-6 p-0">*/}
                  {/*      <p class="p-3 border-bottom border-right">Assigned Balance</p>*/}
                  {/*    </div>*/}
                  {/*    <div class="col-6 p-0 text-right">*/}
                  {/*      <p class="p-3 border-bottom">0.0 OPI</p>*/}
                  {/*    </div>*/}
                  {/*    <div class="col-6 p-0">*/}
                  {/*      <p class="p-3">Refundable Busd</p>*/}
                  {/*    </div>*/}
                  {/*    <div class="col-6 p-0 text-right">*/}
                  {/*      <p class="p-3">0.0 Busd</p>*/}
                  {/*    </div>*/}
                  {/*  </div>*/}
                  {/*  <a href="#" class="btn btn-primary w-50 my-3 tbl-btn">*/}
                  {/*    Refund*/}
                  {/*  </a>*/}
                  {/*</div>*/}
                  <div class="time-line py-5">
                    <div class="ps-timeline-sec">
                      <div class="container pb-5">
                        <ol class="ps-timeline">
                          <li class="line-1">
                            <div class="img-handler-top">
                              <p>2022.04.17</p>
                              <p>12 (UTC)</p>
                            </div>
                            <div class="middle-line">
                              <p>24H</p>
                            </div>
                            <div class="ps-bot"></div>
                            <span class="ps-sp-top it-on-1"></span>
                            <span class="ps-sp-top ps-sp-bottom it-one"></span>
                            <div class="img-handler-bottom">
                              <div class="card-box shadow pb-3 pt-1 item-cardOne px-2">
                                <div class="position-relative card-shape">
                                  <p>Launch</p>
                                </div>
                                <p></p>
                              </div>
                            </div>
                          </li>
                          <li class="line-2">
                            <div class="img-handler-top">
                              <p>2022.04.18</p>
                            </div>
                            <div class="middle-line">
                              <p>24H</p>
                            </div>
                            <div class="ps-top"></div>
                            <span class="ps-sp-top it-two-2"></span>
                            <span class="ps-sp-top ps-sp-bottom it-two"></span>
                            <div class="img-handler-bottom">
                              <div class="card-box shadow pb-3 pt-1 item-cardOne item-cardtwo px-2">
                                <div class="position-relative card-shape">
                                  <p>10%</p>
                                </div>
                                <p>Claimable</p>
                              </div>
                            </div>
                          </li>
                          <li class="line-3">
                            <div class="img-handler-top">
                              <p>2022.04.19</p>
                            </div>
                            <div class="middle-line">
                              <p>24H</p>
                            </div>
                            <div class="ps-bot"></div>
                            <span class="ps-sp-top it-two it-3"></span>
                            <span class="ps-sp-top it-two ps-sp-bottom it-three"></span>
                            <div class="img-handler-bottom">
                              <div class="card-box shadow pb-3 pt-1 item-cardOne px-2">
                                <div class="position-relative card-shape item-card3">
                                  <p>30%</p>
                                </div>
                                <p>Claimable</p>
                              </div>
                            </div>
                          </li>
                          <li class="line-4">
                            <div class="img-handler-top">
                              <p>2022.04.20</p>
                            </div>
                            <div class="middle-line">
                              <p>24H</p>
                            </div>
                            <div class="ps-top"></div>
                            <span class="ps-sp-top it-two it-4"></span>
                            <span class="ps-sp-top it-two ps-sp-bottom it-four"></span>
                            <div class="img-handler-bottom">
                              <div class="card-box shadow pb-3 pt-1 item-cardOne px-2">
                                <div class="position-relative card-shape item-card4">
                                  <p>30%</p>
                                </div>
                                <p>Claimable</p>
                              </div>
                            </div>
                          </li>
                          <li class="line-5">
                            <div class="img-handler-top">
                              <p>2022.04.21</p>
                            </div>
                            <div class="middle-line">
                              <p>24H</p>
                            </div>
                            <div class="ps-bot"></div>
                            <span class="ps-sp-top it-two it-5"></span>
                            <span class="ps-sp-top it-two ps-sp-bottom it-five"></span>
                            <div class="img-handler-bottom">
                              <div class="card-box shadow pb-3 pt-1 item-cardOne px-2">
                                <div class="position-relative card-shape item-card5">
                                  <p>30%</p>
                                </div>
                                <p>Claimable</p>
                              </div>
                            </div>
                          </li>
                          <li class="line-6">
                            <div class="img-handler-top">
                              <p>2022.04.22</p>
                            </div>
                            <div class="middle-line">
                              <p>24H</p>
                            </div>
                            <div class="ps-bot"></div>
                            <span class="ps-sp-top it-two it-6"></span>
                            <span class="ps-sp-top it-two ps-sp-bottom it-six"></span>
                            <div class="img-handler-bottom">
                              <div class="card-box shadow pb-3 pt-1 item-cardOne px-2">
                                <div class="position-relative card-shape item-card6">
                                  <p>30%</p>
                                </div>
                                <p>Claimable</p>
                              </div>
                            </div>
                          </li>
                          <li class="line-7">
                            <div class="img-handler-top">
                              <p>2022.04.23</p>
                            </div>
                            <div class="middle-line">
                              <p>24H</p>
                            </div>
                            <div class="ps-bot"></div>
                            <span class="ps-sp-top it-two it-7"></span>
                            <span class="ps-sp-top it-two ps-sp-bottom it-seven"></span>
                            <div class="img-handler-bottom">
                              <div class="card-box shadow pb-3 pt-1 item-cardOne px-2">
                                <div class="position-relative card-shape item-card7">
                                  <p>30%</p>
                                </div>
                                <p>Claimable</p>
                              </div>
                            </div>
                          </li>
                          <li class="line-8">
                            <div class="img-handler-top">
                              <p>2022.04.24</p>
                            </div>
                            <div class="ps-bot"></div>
                            <span class="ps-sp-top it-two it-8"></span>
                            <span class="ps-sp-top it-two ps-sp-bottom it-eight"></span>
                            <div class="img-handler-bottom">
                              <div class="card-box shadow pb-3 pt-1 item-cardOne px-2">
                                <div class="position-relative card-shape item-card8">
                                  <p>30%</p>
                                </div>
                                <p>Claimable</p>
                              </div>
                            </div>
                          </li>
                        </ol>
                      </div>
                    </div>
                  </div>
                  <div class="time-line py-5 mobile-timeline">
                    <div class="ps-timeline-sec">
                      <div class="container pb-5">
                        <div class="row">
                          <div class="col-5">
                            <div class="left-time-line">
                              <div class="timeline-1">
                                <div class="card-box shadow pb-3 pt-1 item-cardOne px-2">
                                  <div class="position-relative card-shape">
                                    <p>Launch</p>
                                  </div>
                                  <p></p>
                                </div>
                              </div>
                              <div class="timeline-2">
                                <div class="card-box shadow pb-3 pt-1 item-cardOne item-cardtwo px-2">
                                  <div class="position-relative card-shape">
                                    <p>10%</p>
                                  </div>
                                  <p>Claimable</p>
                                </div>
                              </div>
                              <div class="timeline-3">
                                <div class="card-box shadow pb-3 pt-1 item-cardOne px-2">
                                  <div class="position-relative card-shape item-card3">
                                    <p>30%</p>
                                  </div>
                                  <p>Claimable</p>
                                </div>
                              </div>
                              <div class="timeline-4">
                                <div class="card-box shadow pb-3 pt-1 item-cardOne px-2">
                                  <div class="position-relative card-shape item-card4">
                                    <p>30%</p>
                                  </div>
                                  <p>Claimable</p>
                                </div>
                              </div>
                              <div class="timeline-5">
                                <div class="card-box shadow pb-3 pt-1 item-cardOne px-2">
                                  <div class="position-relative card-shape item-card5">
                                    <p>30%</p>
                                  </div>
                                  <p>Claimable</p>
                                </div>
                              </div>
                            </div>
                          </div>
                          <div class="col-2">
                            <div class="w-100 h-100 chart-line position-relative">
                              <div class="position-absolute">
                                <li class="line-one"></li>
                              </div>
                              <div class="position-absolute">
                                <li class="line-one l-2"></li>
                              </div>
                              <div class="position-absolute">
                                <li class="line-one l-3"></li>
                              </div>
                              <div class="position-absolute">
                                <li class="line-one l-4"></li>
                              </div>
                              <div class="position-absolute">
                                <li class="line-one l-5"></li>
                              </div>
                              <hr class="rotate" />
                            </div>
                          </div>
                          <div class="col-5">
                            <div class="right-timeline">
                              <div class="timeline-1 position-relative">
                                <div class="img-handler-top">
                                  <p>2022.03.31</p>
                                  <p>12 (UTC)</p>
                                </div>
                                <div class="middle-line">
                                  <p>24H</p>
                                </div>
                              </div>

                              <div class="timeline-2 position-relative">
                                <div class="img-handler-top">
                                  <p>2022.04.01</p>
                                </div>
                                <div class="middle-line">
                                  <p>24H</p>
                                </div>
                              </div>
                              <div class="timeline-3 position-relative">
                                <div class="img-handler-top">
                                  <p>2022.04.01</p>
                                </div>
                                <div class="middle-line">
                                  <p>24H</p>
                                </div>
                              </div>
                              <div class="timeline-4 position-relative">
                                <div class="img-handler-top">
                                  <p>2022.04.01</p>
                                </div>
                                <div class="middle-line">
                                  <p>24H</p>
                                </div>
                              </div>
                              <div class="timeline-5 position-relative">
                                <div class="img-handler-top">
                                  <p>2022.04.01</p>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </Paper>
    </div>
  );
}

export default IdoPublic;
