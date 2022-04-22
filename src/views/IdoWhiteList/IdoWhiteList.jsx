import "./IdoWhiteList.scss";

import { child, get, ref, set } from "firebase/database";
import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { abi as BUSD_ABI } from "src/abi/IERC20.json";
import { database } from "src/config";
import { addresses } from "src/constants";
import { Account, ContractHelper } from "src/contractHelper";
import { useWeb3Context } from "src/hooks/web3Context";
import { error, info } from "src/slices/MessagesSlice";
import Web3 from "web3";

import Shape1 from "./winner/shape/shap1.png";
import Shape2 from "./winner/shape/shap2.png";
import Shape3 from "./winner/shape/shap3.png";
import Shape4 from "./winner/shape/shap4.png";
import Shape5 from "./winner/shape/shap5.png";
import Shape6 from "./winner/shape/shap6.png";
import Shape8 from "./winner/shape/shap8.png";
import Shape9 from "./winner/shape/shap9.png";
import WinLogo from "./winner/winnerLogo.png";

const IdoWhiteList = () => {
  const { networkId, provider } = useWeb3Context();
  const dispatch = useDispatch();

  const [values, setValues] = useState({
    userBUSD: undefined,
    busd: 0,
    loading: true,
    data: undefined,
    account: undefined,
    isWhitelist: false,
    isTransferingBUSD: false,
    batch_2_start: 1649588400000,
  });
  const [countdown, setcCuntdown] = useState({
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
      get(child(dbRef, `whitelist-users/${account[0]}`))
        .then(snapshot => {
          if (snapshot.exists()) {
            setValues({
              ...values,
              userBUSD: busdBalance,
              data: snapshot.val(),
              account: account[0],
              loading: false,
              isWhitelist: true,
            });
            return snapshot.val();
          } else {
            setValues({ ...values, loading: false, isWhitelist: false, userBUSD: busdBalance, account: account[0] });
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
    console.log(account);
    try {
      const web3 = await ContractHelper(networkId);
      const busdContract = new web3.eth.Contract(BUSD_ABI, addresses[networkId].BUSD);
      let txResponse = await busdContract.methods
        .transfer(
          addresses[networkId].GNOSIS_SAFE, // our treasury address where all BUSD will go
          Web3.utils.toWei(busd, "ether"),
        )
        .send({ from: account });

      const calculated_busd = Number(data?.batch_2_BUSD) > 0 ? Number(data?.batch_2_BUSD) + Number(busd) : Number(busd);
      const createdAt = new Date().getTime();
      if (calculated_busd / 16 > 50) {
        return dispatch(error("You can't buy more than 50 OPI"));
      }
      //Store Data in DB
      set(ref(database, `whitelist-users/${account}`), {
        ...values.data,
        address: account,
        batch_2_BUSD: calculated_busd,
        claimedBusd: 0,
        createdAt,
        requestOPI: calculated_busd / 16,
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

    const countDownDate = new Date(Date.UTC(2022, 3, 17, 11, 0, 0)).getTime(); // whitelistOpenTime=Apr 9, UTC(+00:00) 11:00
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

      setcCuntdown({
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
        setcCuntdown({
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
    <div className="whitelist-area">
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
        <div className="board-top-bar mx-auto p-3">
          <a href='#"' className="nav-link text-primary mb-3">
            Whitelist
          </a>
          <div className="row top-board">
            <div className="col-4">
              <div className="item text-center">
                <h6>Price</h6>
                <h4>16 usd</h4>
              </div>
            </div>
            <div className="col-4">
              <div className="item text-center">
                <h6>Phase</h6>
                <h4>{expire ? "Open" : "Sales Done"} </h4>
              </div>
            </div>
            <div className="col-4">
              <div className="item text-center">
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
          <div className="card-box1 w-50 mx-auto d-flex justify-content-center align-content-center flex-column">
            <div className="row w-100 py-3">
              <div className="col-6 text-center">
                <a href="/ido-whitelist" className="act">
                  Whitelist
                </a>
              </div>
              <div className="col-6 text-center">
                <a className="ido-a-hover" href="/ido-public">
                  Public
                </a>
              </div>
            </div>
            {values.isWhitelist ? (
              <div class="winner-area  shadow">
                <div class="winner-box p-3">
                  <div class="top-winner d-flex justify-content-between">
                    <div class="logo-win w-50">
                      <img src={WinLogo} alt="" class="winner-logo w-25" />
                    </div>
                    <div class="date-winner w-50 text-right">
                      <p>
                        <span class="date">Date:</span> 10 APR UTC 11:00 of 2022
                      </p>
                    </div>
                  </div>
                  <div class="winner-bottom">
                    <div class="winner-text text-center position-relative">
                      <p class="winner-txt">okapi project winner</p>
                      <h2>You are in Whitelist !</h2>
                    </div>
                  </div>
                  <div class="shape-area">
                    <div class="shape1">
                      <img src={Shape1} alt="shape" />
                    </div>
                    <div class="shape2 rotateme">
                      <img src={Shape2} alt="shape" />
                    </div>
                    <div class="shape3">
                      <img src={Shape3} alt="shape" />
                    </div>
                    <div class="shape4">
                      <img src={Shape4} alt="shape" />
                    </div>
                    <div class="shape5">
                      <img src={Shape5} alt="shape" />
                    </div>
                    <div class="shape6 rotateme">
                      <img src={Shape6} alt="shape" />
                    </div>
                    <div class="shape7">
                      <img src={Shape8} alt="shape" />
                    </div>
                    <div class="shape8 rotateme">
                      <img src={Shape9} alt="shape" />
                    </div>
                  </div>
                </div>
              </div>
            ) : null}
            <a
              style={values.data?.address !== values.account ? { pointerEvents: "none" } : void 0}
              href={values.isWhitelist && expire && "#"}
              className="btn btn-primary w-100 white-btn notice-box"
              id="whitelist_notice_box"
            >
              {!expire
                ? "Hi Opies!, We are appreciated of for joining, Stay tuned for our next awesome master piece."
                : values.isWhitelist
                ? "Congratulation!"
                : `You are not whitelist member, use "Public sale"`}
            </a>
            {values.isWhitelist && expire && (
              <div>
                <div className="button-box text-center">
                  <p className="text-left amount-text">Amount to Purchase</p>
                  <div className="d-flex justify-content-between align-content-center pt-1">
                    <input
                      disabled={values.data?.requestOPI > 50}
                      placeholder={
                        values.data?.requestOPI > 50 ? "You can't buy more than 50 OPI" : "Enter BUSD Amount"
                      }
                      value={values.busd}
                      onChange={e => setValues({ ...values, busd: e.target.value })}
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

                  <div className="py-4">
                    <a href="#" className="btn btn-primary w-100 expect-btn d-flex justify-content-between notice-box">
                      <p>Expected Your OPI Balance</p>
                      <span>{Number(values.busd / 16).toFixed(2) || 0.0} OPI</span>
                    </a>
                  </div>
                </div>

                <div className="py-4">
                  <a href="#" className="btn btn-primary w-100 expect-btn d-flex justify-content-between notice-box">
                    <p>Expected Your OPI Balance</p>
                    <span>{Number(values.busd / 16).toFixed(4) || 0} OPI</span>
                  </a>
                </div>
              </div>
            )}
          </div>
          {values.isWhitelist && expire && (
            <div>
              <div className="table-box1 text-center px-3 pb-5">
                <div className="row text-left px-3 pb-0 table-box-bg">
                  <div className="col-12 p-0">
                    <p className="p-3 border-bottom">Current Investment Balance</p>
                  </div>
                  <div className="col-6 p-0">
                    <p className="p-3 border-bottom border-right">Busd Balance</p>
                  </div>
                  <div className="col-6 p-0 text-right">
                    <p className="p-3 border-bottom">{Number(values.userBUSD).toFixed(2) || 0} Busd</p>
                  </div>
                  <div className="col-6 p-0">
                    <p className="p-3 border-bottom border-right">Deposited Balance</p>
                  </div>
                  <div className="col-6 p-0 text-right">
                    <p className="p-3 border-bottom">
                      {Number(values.data?.batch_2_BUSD).toFixed(2)
                        ? Number(values.data?.batch_2_BUSD).toFixed(2)
                        : 0.0}{" "}
                      Busd
                    </p>
                  </div>
                  <div className="col-6 p-0">
                    <p className="p-3">Requested OPI</p>
                  </div>
                  <div className="col-6 p-0 text-right">
                    <p className="p-3">{values.data?.requestOPI || 0.0} OPI</p>
                  </div>
                </div>
                {/*<a href="#" className="btn btn-primary w-50 my-3 tbl-btn">*/}
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
                    <p className="p-3 border-bottom">{`${Number(values.data?.busd).toFixed(2)} Busd`}</p>
                  </div>
                  <div className="col-6 p-0">
                    <p className="p-3">Requested OPI</p>
                  </div>
                  <div className="col-6 p-0 text-right">
                    <p className="p-3">{`${Number(values.data?.busd / 15).toFixed(2) || 0.0} OPI`}</p>
                  </div>
                </div>
                {/*<a href="#" className="btn btn-primary w-50 my-3 tbl-btn">*/}
                {/*  Claim*/}
                {/*</a>*/}
              </div>

              {/*<div className="table-box p-4 text-center">*/}
              {/*  <div className="row text-left table-box-bg">*/}
              {/*    <div className="col-6 p-0">*/}
              {/*      <p className="p-3 border-bottom border-right">Claimed Balance</p>*/}
              {/*    </div>*/}
              {/*    <div className="col-6 p-0 text-right">*/}
              {/*      <p className="p-3 border-bottom">0.0 OPI</p>*/}
              {/*    </div>*/}
              {/*    <div className="col-6 p-0">*/}
              {/*      <p className="p-3 border-bottom border-right">Assigned Balance</p>*/}
              {/*    </div>*/}
              {/*    <div className="col-6 p-0 text-right">*/}
              {/*      <p className="p-3 border-bottom">0.0 OPI</p>*/}
              {/*    </div>*/}
              {/*    <div className="col-6 p-0">*/}
              {/*      <p className="p-3">Refundable Busd</p>*/}
              {/*    </div>*/}
              {/*    <div className="col-6 p-0 text-right">*/}
              {/*      <p className="p-3">0.0 Busd</p>*/}
              {/*    </div>*/}
              {/*  </div>*/}
              {/*  <a href="#" className="btn btn-primary w-50 my-3 tbl-btn">*/}
              {/*    Refund*/}
              {/*  </a>*/}
              {/*</div>*/}
              <div className="time-line py-5">
                <div className="ps-timeline-sec">
                  <div className="container pb-5">
                    <ol className="ps-timeline">
                      <li className="line-1">
                        <div className="img-handler-top">
                          <p>2022.04.17</p>
                          <p>12 (UTC)</p>
                        </div>
                        <div className="middle-line">
                          <p>24H</p>
                        </div>
                        <div className="ps-bot"></div>
                        <span className="ps-sp-top it-on-1"></span>
                        <span className="ps-sp-top ps-sp-bottom it-one"></span>
                        <div className="img-handler-bottom">
                          <div className="card-box shadow pb-3 pt-1 item-cardOne px-2">
                            <div className="position-relative card-shape">
                              <p>Launch</p>
                            </div>
                            <p></p>
                          </div>
                        </div>
                      </li>
                      <li className="line-2">
                        <div className="img-handler-top">
                          <p>2022.04.18</p>
                        </div>
                        <div className="middle-line">
                          <p>24H</p>
                        </div>
                        <div className="ps-top"></div>
                        <span className="ps-sp-top it-two-2"></span>
                        <span className="ps-sp-top ps-sp-bottom it-two"></span>
                        <div className="img-handler-bottom">
                          <div className="card-box shadow pb-3 pt-1 item-cardOne item-cardtwo px-2">
                            <div className="position-relative card-shape">
                              <p>10%</p>
                            </div>
                            <p>Claimable</p>
                          </div>
                        </div>
                      </li>
                      <li className="line-3">
                        <div className="img-handler-top">
                          <p>2022.04.19</p>
                        </div>
                        <div className="middle-line">
                          <p>24H</p>
                        </div>
                        <div className="ps-bot"></div>
                        <span className="ps-sp-top it-two it-3"></span>
                        <span className="ps-sp-top it-two ps-sp-bottom it-three"></span>
                        <div className="img-handler-bottom">
                          <div className="card-box shadow pb-3 pt-1 item-cardOne px-2">
                            <div className="position-relative card-shape item-card3">
                              <p>30%</p>
                            </div>
                            <p>Claimable</p>
                          </div>
                        </div>
                      </li>
                      <li className="line-4">
                        <div className="img-handler-top">
                          <p>2022.04.20</p>
                        </div>
                        <div className="middle-line">
                          <p>24H</p>
                        </div>
                        <div className="ps-top"></div>
                        <span className="ps-sp-top it-two it-4"></span>
                        <span className="ps-sp-top it-two ps-sp-bottom it-four"></span>
                        <div className="img-handler-bottom">
                          <div className="card-box shadow pb-3 pt-1 item-cardOne px-2">
                            <div className="position-relative card-shape item-card4">
                              <p>30%</p>
                            </div>
                            <p>Claimable</p>
                          </div>
                        </div>
                      </li>
                      <li className="line-5">
                        <div className="img-handler-top">
                          <p>2022.04.21</p>
                        </div>
                        <div className="ps-bot"></div>
                        <span className="ps-sp-top it-two it-5"></span>
                        <span className="ps-sp-top it-two ps-sp-bottom it-five"></span>
                        <div className="img-handler-bottom">
                          <div className="card-box shadow pb-3 pt-1 item-cardOne px-2">
                            <div className="position-relative card-shape item-card5">
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

              <div className="time-line py-5 mobile-timeline">
                <div className="ps-timeline-sec">
                  <div className="container pb-5">
                    <div className="row">
                      <div className="col-5">
                        <div className="left-time-line">
                          <div className="timeline-1">
                            <div className="card-box shadow pb-3 pt-1 item-cardOne px-2">
                              <div className="position-relative card-shape">
                                <p>Launch</p>
                              </div>
                              <p></p>
                            </div>
                          </div>
                          <div className="timeline-2">
                            <div className="card-box shadow pb-3 pt-1 item-cardOne item-cardtwo px-2">
                              <div className="position-relative card-shape">
                                <p>10%</p>
                              </div>
                              <p>Claimable</p>
                            </div>
                          </div>
                          <div className="timeline-3">
                            <div className="card-box shadow pb-3 pt-1 item-cardOne px-2">
                              <div className="position-relative card-shape item-card3">
                                <p>30%</p>
                              </div>
                              <p>Claimable</p>
                            </div>
                          </div>
                          <div className="timeline-4">
                            <div className="card-box shadow pb-3 pt-1 item-cardOne px-2">
                              <div className="position-relative card-shape item-card4">
                                <p>30%</p>
                              </div>
                              <p>Claimable</p>
                            </div>
                          </div>
                          <div className="timeline-5">
                            <div className="card-box shadow pb-3 pt-1 item-cardOne px-2">
                              <div className="position-relative card-shape item-card5">
                                <p>30%</p>
                              </div>
                              <p>Claimable</p>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="col-6 p-0 text-right">
                        <p className="p-3 border-bottom">0.0 Busd</p>
                      </div>
                      <div className="col-6 p-0">
                        <p className="p-3 border-bottom border-right">Busd Balance</p>
                      </div>
                      <div className="col-6 p-0 text-right">
                        <p className="p-3 border-bottom">0.0 Busd</p>
                      </div>
                      <div className="col-6 p-0">
                        <p className="p-3">Claimable OPI</p>
                      </div>
                      <div className="col-6 p-0 text-right">
                        <p className="p-3">0.0 OPI</p>
                      </div>
                    </div>
                    <a href="#" className="btn btn-primary w-50 my-3 tbl-btn">
                      Refund
                    </a>
                  </div>
                  <div className="time-line py-5">
                    <div className="ps-timeline-sec">
                      <div className="container pb-5">
                        <ol className="ps-timeline">
                          <li className="line-1">
                            <div className="img-handler-top">
                              <p>2022.04.10</p>
                              <p>12 (UTC)</p>
                            </div>
                            <div className="middle-line">
                              <p>24H</p>
                            </div>
                            <div className="ps-bot"></div>
                            <span className="ps-sp-top it-on-1"></span>
                            <span className="ps-sp-top ps-sp-bottom it-one"></span>
                            <div className="img-handler-bottom">
                              <div className="card-box shadow pb-3 pt-1 item-cardOne px-2">
                                <div className="position-relative card-shape">
                                  <p>Launch</p>
                                </div>
                                <p></p>
                              </div>
                            </div>
                          </li>
                          <li className="line-2">
                            <div className="img-handler-top">
                              <p>2022.04.11</p>
                            </div>
                            <div className="middle-line">
                              <p>24H</p>
                            </div>
                            <div className="ps-top"></div>
                            <span className="ps-sp-top it-two-2"></span>
                            <span className="ps-sp-top ps-sp-bottom it-two"></span>
                            <div className="img-handler-bottom">
                              <div className="card-box shadow pb-3 pt-1 item-cardOne item-cardtwo px-2">
                                <div className="position-relative card-shape">
                                  <p>10%</p>
                                </div>
                                <p>Claimable</p>
                              </div>
                            </div>
                          </li>
                          <li className="line-3">
                            <div className="img-handler-top">
                              <p>2022.04.12</p>
                            </div>
                            <div className="middle-line">
                              <p>24H</p>
                            </div>
                            <div className="ps-bot"></div>
                            <span className="ps-sp-top it-two it-3"></span>
                            <span className="ps-sp-top it-two ps-sp-bottom it-three"></span>
                            <div className="img-handler-bottom">
                              <div className="card-box shadow pb-3 pt-1 item-cardOne px-2">
                                <div className="position-relative card-shape item-card3">
                                  <p>30%</p>
                                </div>
                                <p>Claimable</p>
                              </div>
                            </div>
                          </li>
                          <li className="line-4">
                            <div className="img-handler-top">
                              <p>2022.04.13</p>
                            </div>
                            <div className="middle-line">
                              <p>24H</p>
                            </div>
                            <div className="ps-top"></div>
                            <span className="ps-sp-top it-two it-4"></span>
                            <span className="ps-sp-top it-two ps-sp-bottom it-four"></span>
                            <div className="img-handler-bottom">
                              <div className="card-box shadow pb-3 pt-1 item-cardOne px-2">
                                <div className="position-relative card-shape item-card4">
                                  <p>30%</p>
                                </div>
                                <p>Claimable</p>
                              </div>
                            </div>
                          </li>
                          <li className="line-5">
                            <div className="img-handler-top">
                              <p>2022.04.14</p>
                            </div>
                            <div className="ps-bot"></div>
                            <span className="ps-sp-top it-two it-5"></span>
                            <span className="ps-sp-top it-two ps-sp-bottom it-five"></span>
                            <div className="img-handler-bottom">
                              <div className="card-box shadow pb-3 pt-1 item-cardOne px-2">
                                <div className="position-relative card-shape item-card5">
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

                  <div className="time-line py-5 mobile-timeline">
                    <div className="ps-timeline-sec">
                      <div className="container pb-5">
                        <div className="row">
                          <div className="col-5">
                            <div className="left-time-line">
                              <div className="timeline-1">
                                <div className="card-box shadow pb-3 pt-1 item-cardOne px-2">
                                  <div className="position-relative card-shape">
                                    <p>Launch</p>
                                  </div>
                                  <p></p>
                                </div>
                              </div>
                              <div className="timeline-2">
                                <div className="card-box shadow pb-3 pt-1 item-cardOne item-cardtwo px-2">
                                  <div className="position-relative card-shape">
                                    <p>10%</p>
                                  </div>
                                  <p>Claimable</p>
                                </div>
                              </div>
                              <div className="timeline-3">
                                <div className="card-box shadow pb-3 pt-1 item-cardOne px-2">
                                  <div className="position-relative card-shape item-card3">
                                    <p>30%</p>
                                  </div>
                                  <p>Claimable</p>
                                </div>
                              </div>
                              <div className="timeline-4">
                                <div className="card-box shadow pb-3 pt-1 item-cardOne px-2">
                                  <div className="position-relative card-shape item-card4">
                                    <p>30%</p>
                                  </div>
                                  <p>Claimable</p>
                                </div>
                              </div>
                              <div className="timeline-5">
                                <div className="card-box shadow pb-3 pt-1 item-cardOne px-2">
                                  <div className="position-relative card-shape item-card5">
                                    <p>30%</p>
                                  </div>
                                  <p>Claimable</p>
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className="col-2">
                            <div className="w-100 h-100 chart-line position-relative">
                              <div className="position-absolute">
                                <li className="line-one"></li>
                              </div>
                              <div className="position-absolute">
                                <li className="line-one l-2"></li>
                              </div>
                              <div className="position-absolute">
                                <li className="line-one l-3"></li>
                              </div>
                              <div className="position-absolute">
                                <li className="line-one l-4"></li>
                              </div>
                              <div className="position-absolute">
                                <li className="line-one l-5"></li>
                              </div>
                              <hr className="rotate" />
                            </div>
                          </div>
                          <div className="col-5">
                            <div className="right-timeline">
                              <div className="timeline-1 position-relative">
                                <div className="img-handler-top">
                                  <p>2022.04.10</p>
                                  <p>12 (UTC)</p>
                                </div>
                                <div className="middle-line">
                                  <p>24H</p>
                                </div>
                              </div>

                              <div className="timeline-2 position-relative">
                                <div className="img-handler-top">
                                  <p>2022.04.11</p>
                                </div>
                                <div className="middle-line">
                                  <p>24H</p>
                                </div>
                              </div>
                              <div className="timeline-3 position-relative">
                                <div className="img-handler-top">
                                  <p>2022.04.12</p>
                                </div>
                                <div className="middle-line">
                                  <p>24H</p>
                                </div>
                              </div>
                              <div className="timeline-4 position-relative">
                                <div className="img-handler-top">
                                  <p>2022.04.13</p>
                                </div>
                                <div className="middle-line">
                                  <p>24H</p>
                                </div>
                              </div>
                              <div className="timeline-5 position-relative">
                                <div className="img-handler-top">
                                  <p>2022.04.14</p>
                                </div>
                              </div>
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
  );
};

export default IdoWhiteList;
