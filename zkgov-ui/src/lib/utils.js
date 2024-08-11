const { groth16 } = require("snarkjs");
const {utils}  = require("ffjavascript");

function p256(n) {
	let nstr = n.toString(16);
	while (nstr.length < 64) nstr = "0" + nstr;
	nstr = `0x${nstr}`;
	return nstr; 
};

async function proofToSCFormat(input, wasmPath, zkeyPath) {
  const { proof: _proof, publicSignals: _pub } =
    await groth16.fullProve(input, wasmPath, zkeyPath);
  const proof = utils.unstringifyBigInts(_proof);
  const pub = utils.unstringifyBigInts(_pub);
  let inputs = [];
  for (let i = 0; i < pub.length; i++) {
    inputs.push(p256(pub[i]));
  }
  return {
    a: [p256(proof.pi_a[0]), p256(proof.pi_a[1])],
    b: [
      [p256(proof.pi_b[0][1]), p256(proof.pi_b[0][0])],
      [p256(proof.pi_b[1][1]), p256(proof.pi_b[1][0])],
    ],
    c: [p256(proof.pi_c[0]), p256(proof.pi_c[1])],
    pub: inputs,
  };
};


async function exportCallDataGroth16(input, wasmPath, zkeyPath) {
  const { proof: _proof, publicSignals: _publicSignals } =
    await groth16.fullProve(input, wasmPath, zkeyPath);
  // console.log("_publicSignals", _publicSignals)
  const calldata = await groth16.exportSolidityCallData(_proof, _publicSignals);
  // console.log("calldata", calldata);

  const argv = calldata
    .replace(/["[\]\s]/g, "")
    .split(",")
    .map((x) => BigInt(x).toString());

  const a = [argv[0], argv[1]];
  const b = [
    [argv[2], argv[3]],
    [argv[4], argv[5]],
  ];
  const c = [argv[6], argv[7]];
  const Input = [];

  for (let i = 8; i < argv.length; i++) {
    Input.push(argv[i]);
  }

  return { a, b, c, Input };
}

module.exports = {
  exportCallDataGroth16,
  proofToSCFormat
};
