export type TxResult = {
  hash: string;
  status: number;
};


/* example:
blockHash               0x370a97fb62571e3d6a04c196c9a6099f9246482953a984781e156d4e4949dfb4
blockNumber             6171677
contractAddress         
cumulativeGasUsed       52152
effectiveGasPrice       76562502
from                    0xEaf9135D113b720259d923c044d621e604E1B533
gasUsed                 52152
logs                    [{"address":"0xb05c35133c01c7193f09079eaef97f693ae0e552","topics":["0xab9a16269e54e8ae681de331f196f57a4b158e28d53818a27ff5e5698e291749"],"data":"0x000000000000000000000000f8369061ec7e245d911aec1e4a679760d8d1a530","blockHash":"0x370a97fb62571e3d6a04c196c9a6099f9246482953a984781e156d4e4949dfb4","blockNumber":"0x5e2c1d","blockTimestamp":"0x67b1a133","transactionHash":"0x4fb0b9aad3e213cd3059c21fe5587fb40957bc274b717193be82884bdacc485d","transactionIndex":"0x0","logIndex":"0x0","removed":false}]
logsBloom               0x00010000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000010000000000000000000000000000000000000000000000000000000000000000000000000000000000010000000000000002000000000000000000000000004000000000000000000000000000000000000800000000000000000000000000000000000000000000000000000000000000000000000000
root                    
status                  1 (success)
transactionHash         0x4fb0b9aad3e213cd3059c21fe5587fb40957bc274b717193be82884bdacc485d
transactionIndex        0
type                    2
blobGasPrice            1
blobGasUsed             
authorizationList       
to                      0xb05C35133C01C7193F09079eAeF97F693aE0E552
*/

export const getResultData = (result: string): TxResult => {
  const lines = result.split("\n");
  const data: any = {};
  for (const line of lines) {
    if (line.includes("transactionHash")) {
      data.hash = line.split("transactionHash")[1].trim();
    }
    if (line.includes("status")) {
      const status = line.split("status")[1].trim();
      data.status = status === "1 (success)" ? 1 : 0;
    }
  }
  return data;
};
