import {DepthOffer} from "./depthOffer.model";

export class Depth {
  lastUpdateId: number;
  bids: DepthOffer[];
  asks: DepthOffer[];
}
