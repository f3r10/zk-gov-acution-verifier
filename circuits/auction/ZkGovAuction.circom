pragma circom 2.1.6;
include "../node_modules/circomlib/circuits/poseidon.circom";
include "../node_modules/circomlib/circuits/comparators.circom";

template ZauKtion() {
    // private signals
    signal input bid;
    signal input key;
    //signal input idSecret;

    // public signals
    signal input biddingAddress;
    signal input groupId;
    signal input maxBid;

    component gt = GreaterThan(128);
    gt.in[0] <== bid;
    gt.in[1] <== 0;

    1 === gt.out;

    component lt = LessThan(128);
    lt.in[0] <== bid;
    lt.in[1] <== maxBid;

    1 === lt.out;
    
    // outputs
    signal output idCommitment;
    
    idCommitment <== Poseidon(4)([bid, biddingAddress, groupId, key]);

}

component main { public [groupId, biddingAddress, maxBid] } = ZauKtion();
