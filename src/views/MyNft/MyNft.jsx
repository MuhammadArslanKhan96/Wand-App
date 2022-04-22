import "./MyNft.scss";

import { Paper } from "@olympusdao/component-library";
import background from "src/assets/images/MyNftBg.png";

const MyNft = () => {
  return (
    <div id="public-view">
      <Paper>
        <div class="bg-wrapper">
          <img src={background} class="mynft-bg" />
        </div>
      </Paper>
    </div>
  );
};

export default MyNft;
