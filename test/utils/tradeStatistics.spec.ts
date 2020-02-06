import { calcStatistics } from "../../utils/tradeStatistics";
import { cpz } from "../../@types";

const positions: cpz.PositionDataForStats[] = [
  {
    id: "a2782e74-92aa-4582-b683-c8d99e0a6dd2",
    direction: cpz.PositionDirection.short,
    exitDate: "2019-12-25T01:10:00",
    profit: 0.0272,
    barsHeld: 3
  },
  {
    id: "b07fd731-61d9-4060-aa70-2a9a124cab70",
    direction: cpz.PositionDirection.short,
    exitDate: "2019-12-25T01:25:00",
    profit: -0.0098,
    barsHeld: 1
  },
  {
    id: "2bcbbf20-7845-412e-87a6-fcc3112a5917",
    direction: cpz.PositionDirection.long,
    exitDate: "2019-12-25T02:00:00",
    profit: 0.002459,
    barsHeld: 2
  },
  {
    id: "0d522acd-fe4b-41bc-890d-8e5d4138a068",
    direction: cpz.PositionDirection.long,
    exitDate: "2019-12-25T02:20:00",
    profit: -0.000392,
    barsHeld: 3
  },
  {
    id: "5e8ac6f1-07fa-4242-8824-7701b2448983",
    direction: cpz.PositionDirection.short,
    exitDate: "2019-12-25T02:50:00",
    profit: 0.007,
    barsHeld: 2
  },
  {
    id: "7193d358-4680-4e1a-9fd1-d60057e37ca1",
    direction: cpz.PositionDirection.short,
    exitDate: "2019-12-25T03:00:00",
    profit: -0.0002,
    barsHeld: 1
  },
  {
    id: "a86e392b-0a32-4bef-858e-1af195a776f1",
    direction: cpz.PositionDirection.short,
    exitDate: "2019-12-25T03:25:00",
    profit: 0.031552,
    barsHeld: 4
  },
  {
    id: "b0d94b9d-cfb1-4f56-bd9c-a0c8fae1d7f2",
    direction: cpz.PositionDirection.long,
    exitDate: "2019-12-25T03:50:00",
    profit: 0.000433,
    barsHeld: 2
  },
  {
    id: "5f38b63c-e5d2-49ad-b098-505d8f0384c4",
    direction: cpz.PositionDirection.long,
    exitDate: "2019-12-25T05:00:00",
    profit: 0.0266,
    barsHeld: 5
  },
  {
    id: "77b65f46-5f1d-4798-a00d-8cfe63024cc7",
    direction: cpz.PositionDirection.short,
    exitDate: "2019-12-25T05:50:00",
    profit: 0.002,
    barsHeld: 2
  },
  {
    id: "e768eef7-d20b-4024-8f95-ef7cb12b7372",
    direction: cpz.PositionDirection.short,
    exitDate: "2019-12-25T06:10:00",
    profit: 0.0186,
    barsHeld: 3
  },
  {
    id: "bb898b0a-0489-4850-8b8e-a266be743c17",
    direction: cpz.PositionDirection.short,
    exitDate: "2019-12-25T06:45:00",
    profit: 0.009623,
    barsHeld: 2
  },
  {
    id: "e291eed7-0abf-40be-80b0-11270e82c130",
    direction: cpz.PositionDirection.short,
    exitDate: "2019-12-25T07:00:00",
    profit: 0,
    barsHeld: 2
  },
  {
    id: "98df9584-7f9e-4689-a9cf-855c325d86d7",
    direction: cpz.PositionDirection.short,
    exitDate: "2019-12-25T07:20:00",
    profit: 0.017,
    barsHeld: 3
  },
  {
    id: "30be627f-05ce-415f-903e-7d26b2e69129",
    direction: cpz.PositionDirection.short,
    exitDate: "2019-12-25T07:35:00",
    profit: 0.013703,
    barsHeld: 2
  },
  {
    id: "e4cbf03a-75e6-4926-9ae8-ceb46d678200",
    direction: cpz.PositionDirection.long,
    exitDate: "2019-12-25T08:00:00",
    profit: 0.0358,
    barsHeld: 4
  },
  {
    id: "7159d7ca-9aaf-4704-8687-9e37b1016913",
    direction: cpz.PositionDirection.long,
    exitDate: "2019-12-25T08:20:00",
    profit: 0.0036,
    barsHeld: 3
  },
  {
    id: "518c5b54-ffa4-4acf-a3d2-d37099e44339",
    direction: cpz.PositionDirection.short,
    exitDate: "2019-12-25T09:10:00",
    profit: -0.011,
    barsHeld: 2
  },
  {
    id: "54c84ff0-f30b-4e1f-8dfe-343c653a0d75",
    direction: cpz.PositionDirection.short,
    exitDate: "2019-12-25T09:55:00",
    profit: 0.0472,
    barsHeld: 7
  },
  {
    id: "8b8402ec-ccfc-4a30-b0d2-b076f5266a3b",
    direction: cpz.PositionDirection.short,
    exitDate: "2019-12-25T10:20:00",
    profit: 0.0076,
    barsHeld: 2
  },
  {
    id: "91508d18-6cef-4417-a858-13885998f105",
    direction: cpz.PositionDirection.short,
    exitDate: "2019-12-25T10:50:00",
    profit: 0.0104,
    barsHeld: 2
  },
  {
    id: "444a50ad-e70b-4eea-bfc5-30d66bfbb08c",
    direction: cpz.PositionDirection.short,
    exitDate: "2019-12-25T12:10:00",
    profit: 0.052,
    barsHeld: 3
  },
  {
    id: "b6cef9d9-2900-4195-8624-bb71b6c82e7d",
    direction: cpz.PositionDirection.long,
    exitDate: "2019-12-25T12:40:00",
    profit: 0.0234,
    barsHeld: 5
  },
  {
    id: "7b995b87-e4ca-4726-a0b9-c57eb34e74b8",
    direction: cpz.PositionDirection.short,
    exitDate: "2019-12-25T13:20:00",
    profit: 0.0128,
    barsHeld: 3
  },
  {
    id: "38d2474e-5a01-40b9-b021-81e8d6cbe8ad",
    direction: cpz.PositionDirection.short,
    exitDate: "2019-12-25T13:55:00",
    profit: 0.000343,
    barsHeld: 2
  },
  {
    id: "18ef0e49-e751-4e45-8c16-6a2f2838b925",
    direction: cpz.PositionDirection.short,
    exitDate: "2019-12-25T14:35:00",
    profit: -0.010185,
    barsHeld: 1
  },
  {
    id: "5c733999-d566-4175-9927-722705727446",
    direction: cpz.PositionDirection.long,
    exitDate: "2019-12-25T15:10:00",
    profit: -0.0178,
    barsHeld: 1
  },
  {
    id: "7633dda1-f526-4bd4-8075-ed30fbbcc42f",
    direction: cpz.PositionDirection.long,
    exitDate: "2019-12-25T16:15:00",
    profit: 0.0036,
    barsHeld: 3
  },
  {
    id: "3da33d22-a36b-41a5-812c-93a9972335de",
    direction: cpz.PositionDirection.short,
    exitDate: "2019-12-25T16:55:00",
    profit: 0.0958,
    barsHeld: 5
  },
  {
    id: "c7d0d20a-c509-4dd3-9eaf-672a90329ecd",
    direction: cpz.PositionDirection.long,
    exitDate: "2019-12-25T18:40:00",
    profit: -0.010926,
    barsHeld: 1
  },
  {
    id: "0909670f-16f8-4ef0-bc0d-750cd57cde0a",
    direction: cpz.PositionDirection.long,
    exitDate: "2019-12-25T19:00:00",
    profit: 0.0306,
    barsHeld: 3
  },
  {
    id: "d645ff7f-1c1e-4e22-b52f-ed5b65084e7e",
    direction: cpz.PositionDirection.long,
    exitDate: "2019-12-25T19:30:00",
    profit: 0.0164,
    barsHeld: 5
  },
  {
    id: "41e5125e-aa14-4f3c-bfc0-afa342dd2cc0",
    direction: cpz.PositionDirection.long,
    exitDate: "2019-12-25T20:10:00",
    profit: 0.1104,
    barsHeld: 7
  },
  {
    id: "e075aa24-d652-4b9d-bbce-610c20dd70e5",
    direction: cpz.PositionDirection.short,
    exitDate: "2019-12-25T20:50:00",
    profit: -0.0706,
    barsHeld: 1
  },
  {
    id: "b62593af-a19f-40a6-91c0-25997eb6bf3e",
    direction: cpz.PositionDirection.short,
    exitDate: "2019-12-25T21:10:00",
    profit: -0.0288,
    barsHeld: 3
  },
  {
    id: "50e89437-6523-42bb-836e-11db4e001eff",
    direction: cpz.PositionDirection.short,
    exitDate: "2019-12-25T21:45:00",
    profit: 0.013636,
    barsHeld: 3
  },
  {
    id: "9f1172df-0813-4e07-8191-37eded5a6137",
    direction: cpz.PositionDirection.short,
    exitDate: "2019-12-25T22:23:29.38",
    profit: 0.038092,
    barsHeld: 4
  },
  {
    id: "749fce1d-9c1d-4520-bdf7-f3ae4ad866a1",
    direction: cpz.PositionDirection.long,
    exitDate: "2019-12-25T22:55:45.416",
    profit: 0,
    barsHeld: 1
  },
  {
    id: "d41ca665-9554-4c7e-a94e-7b61ebd8817e",
    direction: cpz.PositionDirection.short,
    exitDate: "2019-12-25T23:40:30.742",
    profit: -0.0006,
    barsHeld: 1
  },
  {
    id: "da967aef-a495-430d-9500-4ddbad9d7c3f",
    direction: cpz.PositionDirection.long,
    exitDate: "2019-12-26T00:20:03.733",
    profit: 0.015882,
    barsHeld: 2
  },
  {
    id: "d015bdb5-4b40-4569-b70b-79307933517a",
    direction: cpz.PositionDirection.short,
    exitDate: "2019-12-26T01:00:02.166",
    profit: -0.003063,
    barsHeld: 1
  },
  {
    id: "4bf4435f-143f-466a-9e87-23a79e30af1a",
    direction: cpz.PositionDirection.long,
    exitDate: "2019-12-26T01:55:36.787",
    profit: -0.004389,
    barsHeld: 0
  },
  {
    id: "f32b6b8c-4ba2-4d4d-a566-e0f8c6da106d",
    direction: cpz.PositionDirection.long,
    exitDate: "2019-12-26T02:15:06.706",
    profit: 0.0056,
    barsHeld: 3
  },
  {
    id: "15f6c572-1165-4d39-978b-89a9a2b05288",
    direction: cpz.PositionDirection.long,
    exitDate: "2019-12-26T02:30:15.989",
    profit: -0.0004,
    barsHeld: 0
  },
  {
    id: "3d8511f7-8401-4c4c-bb13-8c32f44edcca",
    direction: cpz.PositionDirection.short,
    exitDate: "2019-12-26T03:00:03.46",
    profit: -0.0002,
    barsHeld: 1
  },
  {
    id: "676c7735-7e5e-40b3-a9bf-e9297def01e9",
    direction: cpz.PositionDirection.short,
    exitDate: "2019-12-26T03:14:22.883",
    profit: 0,
    barsHeld: 1
  },
  {
    id: "44ba4a1d-957b-45af-94ee-03b803632059",
    direction: cpz.PositionDirection.short,
    exitDate: "2019-12-26T03:21:03.123",
    profit: -0.0002,
    barsHeld: 2
  },
  {
    id: "93bc9e9c-18b9-498e-949a-629093e418a4",
    direction: cpz.PositionDirection.short,
    exitDate: "2019-12-26T04:00:11.556",
    profit: 0.0362,
    barsHeld: 7
  },
  {
    id: "bc67df00-3c8c-43ac-9280-0a84b19fef8a",
    direction: cpz.PositionDirection.long,
    exitDate: "2019-12-26T04:49:17.024",
    profit: -0.0008,
    barsHeld: 1
  },
  {
    id: "ce045a5f-2e2c-4bc9-b2b5-d6aabebe19b3",
    direction: cpz.PositionDirection.short,
    exitDate: "2019-12-26T05:10:33.857",
    profit: -0.0002,
    barsHeld: 0
  },
  {
    id: "50c962a5-e99e-442b-8009-69f9f34c0db6",
    direction: cpz.PositionDirection.short,
    exitDate: "2019-12-26T05:20:08.634",
    profit: -0.0004,
    barsHeld: 0
  },
  {
    id: "6c723c08-0790-41a6-8453-4682ec205f50",
    direction: cpz.PositionDirection.long,
    exitDate: "2019-12-26T08:10:40.566",
    profit: 0.0148,
    barsHeld: 1
  },
  {
    id: "a79ba538-b63d-48c2-b00a-a60bafdf5304",
    direction: cpz.PositionDirection.long,
    exitDate: "2019-12-26T08:25:29.417",
    profit: 0.0124,
    barsHeld: 2
  },
  {
    id: "44986445-c39b-48ca-8edc-464d780054bd",
    direction: cpz.PositionDirection.short,
    exitDate: "2019-12-26T13:20:16.386",
    profit: 0.0068,
    barsHeld: 2
  },
  {
    id: "c422a9a6-316a-4576-bb77-4f765552d227",
    direction: cpz.PositionDirection.short,
    exitDate: "2019-12-26T13:30:02.717",
    profit: -0.0002,
    barsHeld: 1
  },
  {
    id: "a2632445-8902-4aa2-a56c-30a8e596b81d",
    direction: cpz.PositionDirection.short,
    exitDate: "2019-12-26T13:41:27.466",
    profit: -0.0134,
    barsHeld: 2
  },
  {
    id: "d2a6bdef-0bdb-490b-a141-196a8bc9bbe5",
    direction: cpz.PositionDirection.long,
    exitDate: "2019-12-26T14:16:21.792",
    profit: 0.0022,
    barsHeld: 1
  },
  {
    id: "000119b2-e816-412a-b229-fcb19cc1dc98",
    direction: cpz.PositionDirection.short,
    exitDate: "2019-12-26T14:25:23.761",
    profit: -0.0046,
    barsHeld: 0
  },
  {
    id: "4b994235-dfd1-4ba7-8f4f-5788c6781f7d",
    direction: cpz.PositionDirection.short,
    exitDate: "2019-12-26T14:36:56.242",
    profit: -0.0014,
    barsHeld: 1
  },
  {
    id: "47476243-355c-4a27-bf60-225fb540e507",
    direction: cpz.PositionDirection.long,
    exitDate: "2019-12-27T23:00:05.872",
    profit: 0.0806,
    barsHeld: 2
  },
  {
    id: "e93c3cc9-b7b8-441f-8bbc-90d456e1b9e7",
    direction: cpz.PositionDirection.long,
    exitDate: "2019-12-27T23:55:19.769",
    profit: -0.005613,
    barsHeld: 0
  },
  {
    id: "0344a6f0-9902-42c7-97e1-4d57c7361734",
    direction: cpz.PositionDirection.long,
    exitDate: "2019-12-28T00:06:10.454",
    profit: -0.0048,
    barsHeld: 1
  },
  {
    id: "9000c209-5607-4fd1-89e0-f0077bed79c7",
    direction: cpz.PositionDirection.long,
    exitDate: "2019-12-28T00:52:37.048",
    profit: 0.0814,
    barsHeld: 5
  },
  {
    id: "a0ecb8bd-2649-4a70-86c6-19be666e48c9",
    direction: cpz.PositionDirection.long,
    exitDate: "2019-12-28T01:05:02.281",
    profit: -0.0114,
    barsHeld: 1
  },
  {
    id: "15656246-2a1e-4fa4-a4a7-b623e1b41529",
    direction: cpz.PositionDirection.long,
    exitDate: "2019-12-28T01:33:26.232",
    profit: -0.044656,
    barsHeld: 1
  },
  {
    id: "6123fae1-d8d7-42b6-91c7-aac5439a5d02",
    direction: cpz.PositionDirection.long,
    exitDate: "2019-12-28T04:10:29.052",
    profit: -0.017069,
    barsHeld: 0
  },
  {
    id: "e81e3390-df13-4ba3-be28-7e7456d306de",
    direction: cpz.PositionDirection.long,
    exitDate: "2019-12-28T04:20:04.908",
    profit: -0.000223,
    barsHeld: 0
  },
  {
    id: "15076a95-3897-4516-a5eb-1f65b01aa1c4",
    direction: cpz.PositionDirection.long,
    exitDate: "2019-12-28T04:50:04.505",
    profit: -0.0016,
    barsHeld: 2
  },
  {
    id: "3296cb23-b94f-4b7c-96bb-8c5742627a0a",
    direction: cpz.PositionDirection.long,
    exitDate: "2019-12-28T05:29:49.737",
    profit: 0.000864,
    barsHeld: 2
  },
  {
    id: "f41dafd2-bb29-4c49-946b-5b0bf7a861ff",
    direction: cpz.PositionDirection.long,
    exitDate: "2019-12-28T06:00:29.169",
    profit: -0.0026,
    barsHeld: 3
  },
  {
    id: "13560af9-b07d-42e9-8ac2-c1f58cee94f2",
    direction: cpz.PositionDirection.short,
    exitDate: "2019-12-28T08:19:05.115",
    profit: 0.021,
    barsHeld: 2
  },
  {
    id: "d15ce665-03c2-46c2-a60d-97f5c4ac919a",
    direction: cpz.PositionDirection.long,
    exitDate: "2019-12-28T09:35:13.767",
    profit: 0.0104,
    barsHeld: 1
  },
  {
    id: "8a604327-2be2-4c06-80fe-08b073809362",
    direction: cpz.PositionDirection.short,
    exitDate: "2019-12-28T10:25:27.969",
    profit: -0.005011,
    barsHeld: 0
  },
  {
    id: "4cf0bbd8-fcc5-4e5c-a682-8ac26d194576",
    direction: cpz.PositionDirection.long,
    exitDate: "2019-12-28T10:46:08.537",
    profit: -0.0062,
    barsHeld: 3
  },
  {
    id: "1b2babba-1c0a-41e7-bc58-f99c4065e8a2",
    direction: cpz.PositionDirection.long,
    exitDate: "2019-12-28T11:03:19.219",
    profit: -0.008,
    barsHeld: 1
  },
  {
    id: "d091cb6e-a77b-41d3-be04-e2976d408f60",
    direction: cpz.PositionDirection.short,
    exitDate: "2019-12-28T11:17:00.268",
    profit: -0.0056,
    barsHeld: 1
  },
  {
    id: "ea56f693-cbc3-41fd-8a67-1069d7a3b726",
    direction: cpz.PositionDirection.short,
    exitDate: "2019-12-28T11:35:04.83",
    profit: -0.000061,
    barsHeld: 2
  },
  {
    id: "aa9b9add-ba95-46e8-beb8-9f8a2cf677e6",
    direction: cpz.PositionDirection.long,
    exitDate: "2019-12-28T12:05:11.981",
    profit: 0.003094,
    barsHeld: 2
  },
  {
    id: "d7a73f74-1464-42ce-92b3-e032d60c5cc7",
    direction: cpz.PositionDirection.long,
    exitDate: "2019-12-28T12:16:01.112",
    profit: -0.0058,
    barsHeld: 2
  },
  {
    id: "b65a546f-23ae-41b1-81ac-2b92d6a25a13",
    direction: cpz.PositionDirection.long,
    exitDate: "2019-12-28T12:35:33.804",
    profit: 0.0036,
    barsHeld: 1
  },
  {
    id: "45f520ec-ad1e-4659-915c-94792507921f",
    direction: cpz.PositionDirection.long,
    exitDate: "2019-12-28T12:50:04.544",
    profit: 0.0032,
    barsHeld: 2
  },
  {
    id: "1c3a0ac8-88ba-4ba8-a82e-0e42d4a3bbbc",
    direction: cpz.PositionDirection.short,
    exitDate: "2019-12-28T13:20:11.912",
    profit: 0.001599,
    barsHeld: 1
  },
  {
    id: "9cd0c639-1525-42b3-9192-b6a24ee39d77",
    direction: cpz.PositionDirection.short,
    exitDate: "2019-12-28T13:35:06.244",
    profit: 0.006364,
    barsHeld: 2
  },
  {
    id: "960a13c3-0893-4c9a-98e7-7bb823de00f9",
    direction: cpz.PositionDirection.long,
    exitDate: "2019-12-28T14:10:06.984",
    profit: -0.007894,
    barsHeld: 0
  },
  {
    id: "f3003e7e-a798-4f64-96ee-ce78f4b2ef04",
    direction: cpz.PositionDirection.long,
    exitDate: "2019-12-28T14:25:26.925",
    profit: 0.006,
    barsHeld: 1
  },
  {
    id: "8619cda4-90dc-4f6a-abb1-23c3509aa163",
    direction: cpz.PositionDirection.long,
    exitDate: "2019-12-28T15:00:30.527",
    profit: -0.00765,
    barsHeld: 1
  },
  {
    id: "9f369be2-27fc-48bd-8ad5-ed1af7327003",
    direction: cpz.PositionDirection.long,
    exitDate: "2019-12-28T15:23:18.366",
    profit: -0.012645,
    barsHeld: 1
  },
  {
    id: "4b2297a1-c943-47e7-b654-dc265da56473",
    direction: cpz.PositionDirection.long,
    exitDate: "2019-12-28T15:31:38.528",
    profit: -0.118353,
    barsHeld: 2
  },
  {
    id: "b3fdf557-31d2-4b75-920c-d7b5c73648a4",
    direction: cpz.PositionDirection.short,
    exitDate: "2019-12-28T16:11:50.646",
    profit: -0.0214,
    barsHeld: 2
  },
  {
    id: "686b29f7-71eb-4426-9f53-1303bd1e0f49",
    direction: cpz.PositionDirection.long,
    exitDate: "2019-12-28T16:20:49.668",
    profit: -0.0002,
    barsHeld: 0
  },
  {
    id: "16c48400-084a-4cbc-826b-7a46ccb96fe2",
    direction: cpz.PositionDirection.long,
    exitDate: "2019-12-28T16:45:43.527",
    profit: 0.0158,
    barsHeld: 3
  },
  {
    id: "87268131-7ce9-4b88-8bd4-09125367e27f",
    direction: cpz.PositionDirection.long,
    exitDate: "2019-12-28T17:50:02.933",
    profit: 0.00559,
    barsHeld: 1
  },
  {
    id: "4b8a10a1-50bb-40f0-aeef-9cf3482da6bd",
    direction: cpz.PositionDirection.long,
    exitDate: "2019-12-28T18:30:21.876",
    profit: -0.0038,
    barsHeld: 0
  },
  {
    id: "f884bac0-c2e3-4e1f-ad80-bd7323ce3f01",
    direction: cpz.PositionDirection.long,
    exitDate: "2019-12-28T18:41:08.172",
    profit: -0.0004,
    barsHeld: 2
  },
  {
    id: "8a2fe368-d56d-406e-9c9f-81b7cfae4ada",
    direction: cpz.PositionDirection.short,
    exitDate: "2019-12-28T18:50:08.923",
    profit: -0.0186,
    barsHeld: 0
  },
  {
    id: "4610a279-f821-46af-81f3-78a447c30ea9",
    direction: cpz.PositionDirection.short,
    exitDate: "2019-12-28T19:50:41.965",
    profit: -0.0064,
    barsHeld: 0
  },
  {
    id: "1bf49923-f4a5-4adf-b305-c416210b90fc",
    direction: cpz.PositionDirection.short,
    exitDate: "2019-12-28T20:48:19.412",
    profit: 0.0002,
    barsHeld: 2
  },
  {
    id: "54560331-a433-404e-a4fb-4383c187ea0a",
    direction: cpz.PositionDirection.short,
    exitDate: "2019-12-28T20:55:23.644",
    profit: -0.0082,
    barsHeld: 1
  },
  {
    id: "277564b9-2294-4292-89bb-20c8fffca33f",
    direction: cpz.PositionDirection.short,
    exitDate: "2019-12-28T21:05:04.844",
    profit: -0.0122,
    barsHeld: 0
  },
  {
    id: "16bdbc77-b66f-45d3-9934-a2e6b4e48d16",
    direction: cpz.PositionDirection.short,
    exitDate: "2019-12-28T21:25:02.896",
    profit: 0,
    barsHeld: 3
  },
  {
    id: "490ff9f0-4ecb-440a-a2c2-42394f88c7c1",
    direction: cpz.PositionDirection.long,
    exitDate: "2019-12-28T21:55:15.819",
    profit: -0.002,
    barsHeld: 1
  },
  {
    id: "3da0e00c-2984-480e-9253-acc37630b939",
    direction: cpz.PositionDirection.short,
    exitDate: "2019-12-28T22:10:06.39",
    profit: 0.0324,
    barsHeld: 2
  },
  {
    id: "2fa1b212-79ac-4604-9c8a-cfab2c653d5a",
    direction: cpz.PositionDirection.short,
    exitDate: "2019-12-28T23:35:10.776",
    profit: 0.004169,
    barsHeld: 1
  },
  {
    id: "310b4c3a-7588-4e5b-8827-a844e8142932",
    direction: cpz.PositionDirection.short,
    exitDate: "2019-12-28T23:55:03.97",
    profit: -0.0204,
    barsHeld: 0
  },
  {
    id: "de888029-bc7d-48e2-b414-2b1f2fc9d88d",
    direction: cpz.PositionDirection.short,
    exitDate: "2019-12-29T00:10:09.485",
    profit: -0.0066,
    barsHeld: 1
  },
  {
    id: "06f0d1b6-2de6-4131-a9a2-466a856d972c",
    direction: cpz.PositionDirection.long,
    exitDate: "2019-12-29T01:05:19.681",
    profit: -0.0132,
    barsHeld: 0
  },
  {
    id: "164d7f14-b2e8-49cc-bcf1-289de0581b8c",
    direction: cpz.PositionDirection.short,
    exitDate: "2019-12-29T01:20:40.44",
    profit: -0.0002,
    barsHeld: 1
  },
  {
    id: "70520253-73c5-4c3d-b967-aefcd0fdd338",
    direction: cpz.PositionDirection.short,
    exitDate: "2019-12-29T01:34:05.45",
    profit: -0.0002,
    barsHeld: 2
  },
  {
    id: "350ae4f9-4865-4ac9-ab40-e8da7769328e",
    direction: cpz.PositionDirection.long,
    exitDate: "2019-12-29T04:00:31.673",
    profit: -0.003717,
    barsHeld: 2
  },
  {
    id: "371b7f05-8020-4b5f-a765-6020b6fa0261",
    direction: cpz.PositionDirection.long,
    exitDate: "2019-12-29T04:25:06.892",
    profit: -0.004387,
    barsHeld: 0
  },
  {
    id: "88c627d9-e8be-4640-823c-42955c4e4b1b",
    direction: cpz.PositionDirection.short,
    exitDate: "2019-12-29T05:05:05.653",
    profit: 0.011856,
    barsHeld: 2
  },
  {
    id: "6c3c0e42-5841-4f9a-a770-9f003e2764b7",
    direction: cpz.PositionDirection.short,
    exitDate: "2019-12-29T05:15:05.709",
    profit: -0.00447,
    barsHeld: 0
  },
  {
    id: "e4e71f00-ba1a-4fd3-8154-d3f76d546f71",
    direction: cpz.PositionDirection.short,
    exitDate: "2019-12-29T05:30:06.932",
    profit: -0.0028,
    barsHeld: 2
  },
  {
    id: "d8094678-aca1-433f-adef-2f99bd713069",
    direction: cpz.PositionDirection.long,
    exitDate: "2019-12-29T05:50:02.8",
    profit: -0.00207,
    barsHeld: 2
  },
  {
    id: "cd13860b-c668-459d-9285-9bea5cbe1f38",
    direction: cpz.PositionDirection.long,
    exitDate: "2019-12-29T06:10:04.828",
    profit: 0.01,
    barsHeld: 2
  },
  {
    id: "0d83112a-a541-4b9d-9acd-cd6c80849756",
    direction: cpz.PositionDirection.long,
    exitDate: "2019-12-29T06:25:17.224",
    profit: 0.0052,
    barsHeld: 2
  },
  {
    id: "bbf81335-25da-453d-8f24-f2d30d6b0cb5",
    direction: cpz.PositionDirection.long,
    exitDate: "2019-12-29T07:05:04.868",
    profit: -0.0078,
    barsHeld: 0
  },
  {
    id: "9167cadf-ac1d-48f3-b3d6-10cd186f14b9",
    direction: cpz.PositionDirection.short,
    exitDate: "2019-12-29T08:05:19.571",
    profit: -0.0006,
    barsHeld: 3
  },
  {
    id: "8e5718f0-cf54-4bda-98b6-ce674d9febbd",
    direction: cpz.PositionDirection.long,
    exitDate: "2019-12-29T08:23:09.184",
    profit: 0.008324,
    barsHeld: 2
  },
  {
    id: "0c265f56-4115-4e6c-a498-38ba0760037a",
    direction: cpz.PositionDirection.long,
    exitDate: "2019-12-29T08:32:03.676",
    profit: -0.000076,
    barsHeld: 1
  },
  {
    id: "f2e2775d-2b61-47a3-9f7b-20a2416b5177",
    direction: cpz.PositionDirection.long,
    exitDate: "2019-12-29T08:45:29.981",
    profit: 0,
    barsHeld: 1
  },
  {
    id: "0aecf26a-2e70-444c-a829-6f7a1500fd7e",
    direction: cpz.PositionDirection.long,
    exitDate: "2019-12-29T09:00:04.74",
    profit: 0.0066,
    barsHeld: 1
  },
  {
    id: "51f10a39-13d2-4e95-8be3-122b309527af",
    direction: cpz.PositionDirection.short,
    exitDate: "2019-12-29T10:06:37.908",
    profit: -0.0002,
    barsHeld: 0
  },
  {
    id: "144a5b89-add2-49b0-b0a5-dfde4326a370",
    direction: cpz.PositionDirection.long,
    exitDate: "2019-12-29T10:25:36.373",
    profit: -0.000045,
    barsHeld: 2
  },
  {
    id: "2a9a8096-29a5-4487-a32d-139eb9af34cb",
    direction: cpz.PositionDirection.long,
    exitDate: "2019-12-29T10:36:01.913",
    profit: -0.0002,
    barsHeld: 0
  },
  {
    id: "22811de4-f889-4c4a-b558-bad533809426",
    direction: cpz.PositionDirection.long,
    exitDate: "2019-12-29T10:45:29.613",
    profit: -0.0002,
    barsHeld: 1
  },
  {
    id: "30beb65d-8076-45f4-9258-1d01e5198550",
    direction: cpz.PositionDirection.long,
    exitDate: "2019-12-29T10:56:12.052",
    profit: -0.0002,
    barsHeld: 1
  },
  {
    id: "e7bf7484-12da-4cde-8dd2-acddfc7c6ebe",
    direction: cpz.PositionDirection.long,
    exitDate: "2019-12-29T11:07:45.188",
    profit: -0.0002,
    barsHeld: 1
  },
  {
    id: "ec11b2a6-1fc8-4493-a94f-f226062bf012",
    direction: cpz.PositionDirection.long,
    exitDate: "2019-12-29T11:25:02.448",
    profit: 0.0276,
    barsHeld: 3
  },
  {
    id: "aa0da461-c7c1-4d6c-879f-f14ec2bb141c",
    direction: cpz.PositionDirection.short,
    exitDate: "2019-12-29T12:15:35.544",
    profit: 0.0154,
    barsHeld: 2
  },
  {
    id: "50de686b-50df-4fad-ae64-a5b8744bfdf4",
    direction: cpz.PositionDirection.long,
    exitDate: "2019-12-29T12:30:36.245",
    profit: 0.0112,
    barsHeld: 2
  },
  {
    id: "5b08d302-dc91-4f38-a5b0-a3bbdd3dbfff",
    direction: cpz.PositionDirection.long,
    exitDate: "2019-12-29T12:40:09.837",
    profit: -0.001738,
    barsHeld: 0
  },
  {
    id: "b614b274-b6f5-4d38-abee-77023c40dca5",
    direction: cpz.PositionDirection.long,
    exitDate: "2019-12-29T13:03:06.704",
    profit: 0.0004,
    barsHeld: 2
  },
  {
    id: "6cbe6eac-0ea1-4595-bfcf-d7a4f161dd4d",
    direction: cpz.PositionDirection.long,
    exitDate: "2019-12-29T19:00:02.891",
    profit: -0.0132,
    barsHeld: 0
  },
  {
    id: "d1cc26fd-2309-4241-b6f8-2ae1ba7c55ca",
    direction: cpz.PositionDirection.long,
    exitDate: "2019-12-29T19:35:02.994",
    profit: -0.0024,
    barsHeld: 2
  },
  {
    id: "2a21befd-109d-4654-94e4-7875f8395177",
    direction: cpz.PositionDirection.long,
    exitDate: "2019-12-29T20:01:02.235",
    profit: 0.06,
    barsHeld: 4
  },
  {
    id: "aeffa89b-bae2-49aa-85cf-2d9f02ba3a94",
    direction: cpz.PositionDirection.long,
    exitDate: "2019-12-29T22:31:27.352",
    profit: 0.001553,
    barsHeld: 3
  },
  {
    id: "fcc54ef5-6fa6-417e-b60e-db7651828dc4",
    direction: cpz.PositionDirection.long,
    exitDate: "2019-12-29T22:53:44.598",
    profit: -0.0024,
    barsHeld: 3
  },
  {
    id: "8bddc084-1113-45de-af4e-fb2d9dbf155e",
    direction: cpz.PositionDirection.short,
    exitDate: "2019-12-29T23:05:41.339",
    profit: -0.0018,
    barsHeld: 2
  },
  {
    id: "5567e5e3-a1d6-4034-9581-e91a5da579f0",
    direction: cpz.PositionDirection.short,
    exitDate: "2019-12-29T23:55:38.06",
    profit: 0.008,
    barsHeld: 2
  },
  {
    id: "c2d76acb-b7bc-45c9-9fc4-1bb37446263d",
    direction: cpz.PositionDirection.short,
    exitDate: "2019-12-30T00:31:00.33",
    profit: 0.092,
    barsHeld: 6
  },
  {
    id: "2d121827-b2c1-493f-860a-94aac3dab6f2",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-01-10T04:37:04.634",
    profit: 0.7736,
    barsHeld: 0
  },
  {
    id: "0c5f8c48-51ef-4128-ab40-443b75b58695",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-01-10T04:50:11.339",
    profit: -0.023,
    barsHeld: 3
  },
  {
    id: "008d518b-5b0c-446c-9c36-81537173e486",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-01-10T05:45:22.75",
    profit: 0.021,
    barsHeld: 2
  },
  {
    id: "af1039cb-52ce-434f-bafd-ea69aa8333dc",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-01-10T06:05:09.626",
    profit: 0.0138,
    barsHeld: 1
  },
  {
    id: "6c0b91be-3c0c-4083-a6fe-fa44be83b678",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-01-10T06:26:12.107",
    profit: 0.0052,
    barsHeld: 3
  },
  {
    id: "2131c4c2-2a9e-445a-ad3c-d23819045c8f",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-01-10T07:55:02.239",
    profit: -0.0014,
    barsHeld: 2
  },
  {
    id: "55425dcc-0d84-4806-916c-6c7e5331c2d0",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-01-10T08:30:19.4",
    profit: 0.0248,
    barsHeld: 5
  },
  {
    id: "0b204179-ad98-45c4-a559-24b15c0318a6",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-01-10T08:50:06.881",
    profit: -0.002074,
    barsHeld: 0
  },
  {
    id: "0975887b-1020-4f25-8653-996e2e63f340",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-01-10T09:30:06.604",
    profit: 0.01746,
    barsHeld: 3
  },
  {
    id: "a89b4b4d-562d-412b-afef-3b7a5beaa239",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-01-10T10:22:17.401",
    profit: 0.0026,
    barsHeld: 2
  },
  {
    id: "a25c1cc8-b9e5-4723-b2c2-7b6978ce9c7e",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-01-10T10:35:03.625",
    profit: 0.0138,
    barsHeld: 2
  },
  {
    id: "296e7d96-467e-4f29-ab38-52e3f9e862ea",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-01-10T11:10:03.835",
    profit: -0.0136,
    barsHeld: 1
  },
  {
    id: "dfcb535b-c927-4c2c-a303-2399f55d6cf0",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-01-10T11:25:48.21",
    profit: 0.0148,
    barsHeld: 2
  },
  {
    id: "c561ff30-a959-4421-80c3-e1c91cfd7d6a",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-01-10T11:35:06.837",
    profit: -0.0212,
    barsHeld: 1
  },
  {
    id: "9057a53a-6837-4e04-a9a8-43dcfa64393d",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-01-10T12:11:35.59",
    profit: -0.0158,
    barsHeld: 2
  },
  {
    id: "72bacdf6-90b2-4942-b028-aad5aecb6208",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-01-10T12:40:02.814",
    profit: -0.0292,
    barsHeld: 0
  },
  {
    id: "85d832ce-d041-4ea9-900b-1adebbccb092",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-01-10T12:52:22.247",
    profit: -0.0038,
    barsHeld: 1
  },
  {
    id: "2664c4b1-5513-4ad1-94be-6cdc0ca8e229",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-01-10T13:08:35.182",
    profit: -0.028,
    barsHeld: 2
  },
  {
    id: "4cf65ab7-85ea-437b-91b3-a70f8bb77eb5",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-01-10T13:45:49.487",
    profit: 0.0332,
    barsHeld: 4
  },
  {
    id: "3a5ff98f-c437-4400-bc0e-9e6e5114023f",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-01-10T14:08:35.017",
    profit: -0.0182,
    barsHeld: 2
  },
  {
    id: "5bb455df-e4dc-4f75-be7e-777b6c4a508d",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-01-10T14:50:13.962",
    profit: 0.02,
    barsHeld: 2
  },
  {
    id: "e80bdffd-d448-4b45-afc5-4abee9d2f823",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-01-10T15:05:16.961",
    profit: -0.0282,
    barsHeld: 2
  },
  {
    id: "dcc0af1e-8d2c-4b29-b82a-b0e17df4e0c2",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-01-10T15:26:41.748",
    profit: 0.1218,
    barsHeld: 3
  },
  {
    id: "ff03071c-49eb-4deb-831e-05112de504e2",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-01-10T15:57:02.87",
    profit: -0.0528,
    barsHeld: 1
  },
  {
    id: "157f1fce-af44-4518-b1d8-43877c2c2049",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-01-10T16:09:40.457",
    profit: -0.0408,
    barsHeld: 1
  },
  {
    id: "39af79d5-73c0-4664-824b-7cf1cbc5e492",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-01-10T16:15:13.776",
    profit: -0.089,
    barsHeld: 1
  },
  {
    id: "35beac46-0a35-469f-840a-5f96d742779a",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-01-10T16:25:02.606",
    profit: -0.0756,
    barsHeld: 0
  },
  {
    id: "cd9e5112-d3db-4f46-abc2-963bc2e8fff4",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-01-10T17:05:03.799",
    profit: 0.019,
    barsHeld: 1
  },
  {
    id: "b5e4707e-545c-475a-8060-92311b45e142",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-01-10T17:28:27.42",
    profit: 0.001,
    barsHeld: 2
  },
  {
    id: "f5c78697-d3ca-44fc-acf3-82810fab88ba",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-01-13T13:54:27.336",
    profit: 0.2458,
    barsHeld: 815
  },
  {
    id: "7f88f12d-0bab-4194-80db-5a2d8009cc12",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-01-13T16:41:49.898",
    profit: -0.0132,
    barsHeld: 27
  },
  {
    id: "27532a41-1848-435d-84aa-7f5cf9de344e",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-01-14T13:55:03.778",
    profit: -0.0291,
    barsHeld: 1
  },
  {
    id: "aac5369b-f405-458a-8794-7e54bcd674b5",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-01-14T14:10:01.762",
    profit: -0.038938,
    barsHeld: 1
  },
  {
    id: "e969bff1-ad88-444b-9c97-6da5fb16ef2e",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-01-14T14:20:01.692",
    profit: -0.050604,
    barsHeld: 1
  },
  {
    id: "320fbbf0-91f3-4ac9-9b00-5262e9e1773a",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-01-14T17:55:02.732",
    profit: -0.1122,
    barsHeld: 1
  },
  {
    id: "eedd587b-f9ed-4022-89fb-1333f5b413bd",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-01-14T18:15:54.353",
    profit: -0.01,
    barsHeld: 3
  },
  {
    id: "ab61e794-cee9-4879-ae6d-438a1c8e47b7",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-01-14T18:45:02.63",
    profit: -0.005327,
    barsHeld: 2
  },
  {
    id: "f722c9ea-06df-4d71-9c65-fb4dcf9d60ff",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-01-14T19:52:34.039",
    profit: -0.034,
    barsHeld: 2
  },
  {
    id: "5f325a0f-7343-4c7a-bbdf-3e749966d5b9",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-01-14T20:37:52.456",
    profit: 0.0104,
    barsHeld: 3
  },
  {
    id: "c88536c6-f513-43fc-a6a7-95246b21c070",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-01-14T20:55:27.048",
    profit: 0.0114,
    barsHeld: 2
  },
  {
    id: "13719a84-cb74-4c1a-8020-a8ccda501c98",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-01-15T04:31:40.181",
    profit: 0.0906,
    barsHeld: 1
  },
  {
    id: "07da98ab-48bb-4fcd-b753-df344037604e",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-01-15T05:20:05.261",
    profit: -0.0674,
    barsHeld: 4
  },
  {
    id: "b9d40be1-1e5c-4749-b0ab-3c4e24952318",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-01-15T07:35:07.733",
    profit: -0.014373,
    barsHeld: 0
  },
  {
    id: "9c62e86c-86b3-4ccd-b39e-a30ead62fcc0",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-01-15T08:08:53.24",
    profit: -0.0278,
    barsHeld: 1
  },
  {
    id: "b908b57c-a9f4-4559-90d8-cc206ee653b3",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-01-15T08:16:00.148",
    profit: -0.0566,
    barsHeld: 2
  },
  {
    id: "21bb07ca-b896-4825-be0c-5239908f6639",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-01-15T08:45:11.354",
    profit: 0.026,
    barsHeld: 5
  },
  {
    id: "0038b169-ce6b-4e4a-bd73-b7413e888c7f",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-01-15T09:40:06.88",
    profit: -0.0146,
    barsHeld: 0
  },
  {
    id: "b911f47f-ad1a-4160-b28f-24289b950794",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-01-15T10:00:02.666",
    profit: 0.1146,
    barsHeld: 2
  },
  {
    id: "b3c3d044-a9cd-49fc-83bd-df8118b7f22c",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-01-15T10:10:31.132",
    profit: -0.066,
    barsHeld: 1
  },
  {
    id: "9ded60e8-bfa4-4e7c-b46c-cd698a05b365",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-01-15T11:04:37.819",
    profit: -0.005,
    barsHeld: 2
  },
  {
    id: "689747c6-a5f0-4a7b-941d-70fbdd4dd76d",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-01-15T12:05:28.188",
    profit: 0.050988,
    barsHeld: 4
  },
  {
    id: "9dea4396-cfb8-47c3-be5d-e9f6dc058e07",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-01-15T12:35:05.975",
    profit: -0.003,
    barsHeld: 1
  },
  {
    id: "bd970911-41b2-48df-98e0-adb4087967b9",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-01-15T12:45:03.357",
    profit: -0.0224,
    barsHeld: 1
  },
  {
    id: "7eb6c1cc-395b-4911-901b-74208122e946",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-01-15T13:00:38.068",
    profit: -0.0254,
    barsHeld: 2
  },
  {
    id: "7c87cde9-4f98-4a92-8445-7e6420cbab53",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-01-15T13:10:05.681",
    profit: -0.0108,
    barsHeld: 0
  },
  {
    id: "c1202ac4-a14f-43fc-8917-491f9f03f7ea",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-01-15T14:01:17.298",
    profit: 0.054988,
    barsHeld: 3
  },
  {
    id: "9b755907-03ea-41e7-8c61-09c71b4aa132",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-01-15T14:15:03.004",
    profit: -0.102,
    barsHeld: 0
  },
  {
    id: "5604106f-1fd1-4d62-a535-1c56c0a3c4d2",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-01-15T14:59:17.641",
    profit: -0.0118,
    barsHeld: 1
  },
  {
    id: "14c179f0-b863-444e-94a4-0cc5b91baaee",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-01-15T15:50:20.506",
    profit: 0.0846,
    barsHeld: 7
  },
  {
    id: "c6404442-0286-4631-bb72-63c9f082a310",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-01-15T16:11:15.564",
    profit: -0.0642,
    barsHeld: 2
  },
  {
    id: "a4c85e85-0ef8-430a-ad42-4373f89bf196",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-01-15T17:12:13.334",
    profit: 0.057,
    barsHeld: 2
  },
  {
    id: "dd534f49-81ed-473c-af29-20091dc5407e",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-01-15T18:05:10.854",
    profit: 0,
    barsHeld: 2
  },
  {
    id: "d9534695-22d3-4360-a9dc-f4facafa2dd2",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-01-15T18:40:05.264",
    profit: 0.0254,
    barsHeld: 6
  },
  {
    id: "c97bd151-0f33-4f47-93a5-5bd553b365a0",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-01-15T19:29:37.221",
    profit: 0.0172,
    barsHeld: 4
  },
  {
    id: "e45cbce9-8f7b-464f-a14d-68b7bc8fedf7",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-01-15T19:40:03.683",
    profit: 0.0002,
    barsHeld: 2
  },
  {
    id: "7486330c-9df4-4c00-84b1-05330024cbf5",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-01-15T20:25:05.806",
    profit: 0.0044,
    barsHeld: 1
  },
  {
    id: "65e1f722-2a77-486d-83ca-ef1032b1e901",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-01-15T20:45:09.632",
    profit: 0.014,
    barsHeld: 1
  },
  {
    id: "7463307b-aa78-4d85-a1a3-832f3eac45ad",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-01-15T21:00:09.929",
    profit: 0.0016,
    barsHeld: 2
  },
  {
    id: "123235c8-6f82-4213-88b8-74ba9236aae9",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-01-15T21:28:08.163",
    profit: 0.0216,
    barsHeld: 4
  },
  {
    id: "2f06e64b-b4e0-43fa-a1fc-5de6971a8072",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-01-15T21:46:25.291",
    profit: -0.0228,
    barsHeld: 2
  },
  {
    id: "48d70d8a-a810-4e45-ab3c-d196ceb5b147",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-01-15T22:25:04.89",
    profit: 0.0008,
    barsHeld: 1
  },
  {
    id: "235954e3-1eff-482d-b4c1-217a7e5b8166",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-01-15T22:47:53.679",
    profit: 0.0086,
    barsHeld: 3
  },
  {
    id: "80d260fb-7481-4348-8c1e-5f6b4fe1645f",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-01-15T23:05:05.825",
    profit: 0.0058,
    barsHeld: 1
  },
  {
    id: "42287cdd-570a-4606-b5b0-760bd8d2f1e8",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-01-15T23:25:04.413",
    profit: -0.032251,
    barsHeld: 4
  },
  {
    id: "746a42cd-a533-43c3-873f-ea28da6db914",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-01-16T06:50:04.933",
    profit: 0.230149,
    barsHeld: 86
  },
  {
    id: "0e0bf468-301d-4418-ab18-e297fdf3dca4",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-01-16T07:03:09.38",
    profit: -0.0002,
    barsHeld: 1
  },
  {
    id: "1bb2e12a-99c5-4eef-aa31-e0166fd74919",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-01-16T07:25:04.866",
    profit: 0.0032,
    barsHeld: 1
  },
  {
    id: "f562b29e-3f48-4768-8b5d-58f55f2629ec",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-01-16T07:38:12.987",
    profit: -0.0002,
    barsHeld: 1
  },
  {
    id: "5054b415-c14a-46c4-9780-421e08ba96bf",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-01-16T08:26:03.095",
    profit: 0.0646,
    barsHeld: 2
  },
  {
    id: "a7b481ac-5189-452a-8a71-c742969546e7",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-01-16T08:44:56.558",
    profit: -0.005653,
    barsHeld: 1
  },
  {
    id: "f30fd5e8-65e9-46bb-a9cf-4447436b49fc",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-01-16T09:06:32.737",
    profit: -0.0062,
    barsHeld: 1
  },
  {
    id: "36cdbf0b-d622-4c25-90e1-4c50f3eee7bf",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-01-16T09:20:03.81",
    profit: 0.0264,
    barsHeld: 1
  },
  {
    id: "d876b941-a765-423b-b916-8134af876354",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-01-16T09:33:19.646",
    profit: 0,
    barsHeld: 1
  },
  {
    id: "33acb941-9dd8-4f91-9265-b3489eba65a6",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-01-16T09:45:30.672",
    profit: -0.0028,
    barsHeld: 1
  },
  {
    id: "b3da5be2-b1b0-4294-8395-a2b632af0eee",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-01-16T10:17:47.415",
    profit: -0.017,
    barsHeld: 1
  },
  {
    id: "8686f553-7afa-4764-9404-573c58ffc989",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-01-16T10:47:12.571",
    profit: -0.0176,
    barsHeld: 2
  },
  {
    id: "c5371390-acf3-4526-aab8-e661a3117aff",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-01-16T11:12:26.829",
    profit: -0.001322,
    barsHeld: 1
  },
  {
    id: "5f2d2ecb-8ff8-46c2-afcc-e96eb8644a40",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-01-16T11:26:17.133",
    profit: -0.0146,
    barsHeld: 1
  },
  {
    id: "8b875af6-909d-4405-a9d8-74453075a995",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-01-16T11:49:42.585",
    profit: 0.08,
    barsHeld: 3
  },
  {
    id: "9460dc67-f840-4af2-a8e6-db8ceb3dff91",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-01-16T12:20:02.965",
    profit: 0.0744,
    barsHeld: 4
  },
  {
    id: "361a352c-5f6f-40db-b601-de17eaabc06b",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-01-16T12:31:02.758",
    profit: -0.0004,
    barsHeld: 1
  },
  {
    id: "318a37a0-ee65-46a1-9c76-d3aad6bcfbee",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-01-16T13:30:47.603",
    profit: 0.098453,
    barsHeld: 7
  },
  {
    id: "1a49844f-a8c5-4bba-b990-d0fa92219918",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-01-16T14:20:33",
    profit: 0.0348,
    barsHeld: 3
  },
  {
    id: "ed1999f0-b1cd-4f7a-861d-04691bb12931",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-01-16T15:10:26.451",
    profit: 0.016,
    barsHeld: 3
  },
  {
    id: "204b80dd-be59-44f9-a594-adb50d7d42f9",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-01-16T16:00:55.11",
    profit: 0.013222,
    barsHeld: 3
  },
  {
    id: "2618cace-a16f-4bc1-8c2b-3d173e094c9a",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-01-16T16:40:05.951",
    profit: 0.067652,
    barsHeld: 5
  },
  {
    id: "7556cd4e-ccd5-44f0-b8df-6b4462bbfad5",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-01-16T17:25:05.86",
    profit: 0.0426,
    barsHeld: 2
  },
  {
    id: "719b1980-0606-43e6-bb37-21ace47599fb",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-01-16T17:45:40.088",
    profit: 0.0282,
    barsHeld: 3
  },
  {
    id: "9d4850b2-969c-4a44-9760-1a3f1e37c94f",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-01-16T18:20:18.587",
    profit: 0.009935,
    barsHeld: 2
  },
  {
    id: "31735bba-e63c-424a-801c-b07a04ca576c",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-01-16T18:50:12",
    profit: -0.0054,
    barsHeld: 0
  },
  {
    id: "2120ef5a-595e-4295-b7bd-b578f161ae34",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-01-16T19:00:08.868",
    profit: -0.0158,
    barsHeld: 2
  },
  {
    id: "f2547888-a5fe-4a7a-8076-7747b968ca01",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-01-16T19:25:59.567",
    profit: -0.0034,
    barsHeld: 2
  },
  {
    id: "5d692e98-d018-4076-8962-fe696e280b3f",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-01-16T19:35:05.739",
    profit: -0.0138,
    barsHeld: 1
  },
  {
    id: "e361a458-eaab-46bd-9698-179e897484a8",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-01-16T20:05:17.676",
    profit: -0.0298,
    barsHeld: 0
  },
  {
    id: "6da10a76-d75a-4b10-b9f1-4c05e769fd55",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-01-16T20:37:15.254",
    profit: 0.003,
    barsHeld: 3
  },
  {
    id: "28b208ff-6401-45e5-b31e-7ac84b39be6d",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-01-16T21:02:42.681",
    profit: 0.0328,
    barsHeld: 2
  },
  {
    id: "1fec6257-d90a-4c26-9625-53041dce80be",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-01-16T21:20:04.688",
    profit: 0.0258,
    barsHeld: 1
  },
  {
    id: "704b674a-a6dd-4da8-b260-bcd47a7cecda",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-01-16T21:30:09.078",
    profit: -0.012,
    barsHeld: 2
  },
  {
    id: "bc9e3831-cfad-4434-b780-0d2de0a30434",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-01-16T22:46:00.606",
    profit: 0.039,
    barsHeld: 3
  },
  {
    id: "9bde345e-6ceb-4dd4-bd4c-33a07ad5acda",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-01-16T23:20:40.235",
    profit: 0.002,
    barsHeld: 3
  },
  {
    id: "ba4a0b8f-6f48-46a3-8140-9b925965691a",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-01-16T23:46:38.193",
    profit: 0.0002,
    barsHeld: 2
  },
  {
    id: "261ff9f1-e409-480c-97a7-7ad46cbfa84b",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-01-20T08:06:14.829",
    profit: 0.2192,
    barsHeld: 894
  },
  {
    id: "601bcecf-b7bf-42d5-811d-d61a3ac8413a",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-01-20T08:31:03.59",
    profit: -0.005,
    barsHeld: 2
  },
  {
    id: "239c7f72-f110-474d-966c-17543989c1c2",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-01-20T08:45:05.667",
    profit: -0.010404,
    barsHeld: 0
  },
  {
    id: "2ede707d-c29e-4cf0-87e3-32e88a34629e",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-01-20T09:20:04.601",
    profit: 0.0116,
    barsHeld: 2
  },
  {
    id: "e27bd9bf-f272-483c-9ea1-d57f7266c4f0",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-01-20T10:00:25.642",
    profit: -0.000243,
    barsHeld: 1
  },
  {
    id: "1185e974-445b-4e8f-9fae-34fbae6b4222",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-01-20T10:26:55.544",
    profit: 0.004812,
    barsHeld: 2
  },
  {
    id: "fbf8889f-3397-43a5-bbfc-24c8384093a2",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-01-20T10:40:20.819",
    profit: 0.0018,
    barsHeld: 1
  },
  {
    id: "8dbd303e-86d1-4d84-bc5f-715b5547217b",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-01-20T10:56:07.702",
    profit: -0.0148,
    barsHeld: 0
  },
  {
    id: "b8cea413-94ac-41bd-992d-504a2ced7278",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-01-20T11:40:02.943",
    profit: 0.0064,
    barsHeld: 2
  },
  {
    id: "57e1cef7-5e7a-4b5c-bea7-e41eba812bb1",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-01-20T11:50:08.947",
    profit: -0.0002,
    barsHeld: 1
  },
  {
    id: "5995d78c-dbae-4aa1-8bb7-3ad3b872d50c",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-01-20T12:10:03.721",
    profit: 0.009317,
    barsHeld: 2
  },
  {
    id: "4857f8ab-2a0f-4e25-b744-deaee5c08186",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-01-20T12:35:04.647",
    profit: 0.0306,
    barsHeld: 2
  },
  {
    id: "11607b0a-5ae7-45df-9669-ed592e4735c7",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-01-20T14:55:11.567",
    profit: -0.0002,
    barsHeld: 1
  },
  {
    id: "35552735-0ccb-4e65-b804-11f9c0b770e4",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-01-20T15:05:25.289",
    profit: -0.029,
    barsHeld: 1
  },
  {
    id: "48799d2f-16d1-4e96-9db1-6f76060b9c37",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-01-20T16:10:07.381",
    profit: 0.0432,
    barsHeld: 4
  },
  {
    id: "6ad017e9-64a4-4831-9071-0075521e3a09",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-01-20T17:41:15.289",
    profit: 0.0032,
    barsHeld: 3
  },
  {
    id: "24efa0fc-c117-468a-86a4-ec8431a2e306",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-01-20T17:55:29.835",
    profit: -0.0084,
    barsHeld: 1
  },
  {
    id: "c5d60a8e-a043-4c4d-9e8a-56230c8d1187",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-01-20T18:05:36.779",
    profit: -0.0098,
    barsHeld: 0
  },
  {
    id: "6282f46c-6f84-40cf-9a4d-9b1467e05044",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-01-20T18:15:32.799",
    profit: -0.0132,
    barsHeld: 0
  },
  {
    id: "cd7eca96-65e2-48cc-8203-b0f44ad5cc16",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-01-20T18:30:23.658",
    profit: -0.011,
    barsHeld: 1
  },
  {
    id: "0f404f39-b441-42d2-944f-92b074d1156e",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-01-20T18:45:15.135",
    profit: -0.006282,
    barsHeld: 2
  },
  {
    id: "115d897a-2c8d-488f-8949-6d8ba844bf41",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-01-20T18:55:09.554",
    profit: -0.000117,
    barsHeld: 1
  },
  {
    id: "f820221f-9d52-467b-8848-8edcac5a9a36",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-01-20T19:12:44.652",
    profit: 0.0008,
    barsHeld: 2
  },
  {
    id: "a6c39d8a-418b-4bdf-84a9-d2a9e0ff5f1a",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-01-20T19:34:15.249",
    profit: -0.010006,
    barsHeld: 1
  },
  {
    id: "13e3ea9b-859f-40ca-ba87-0a04b20c89e5",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-01-20T19:58:16.502",
    profit: 0.0018,
    barsHeld: 3
  },
  {
    id: "ea9301d3-64bd-4348-86c5-0865d066210b",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-01-20T20:35:04.326",
    profit: 0.0028,
    barsHeld: 2
  },
  {
    id: "8c5c073d-d508-4cad-bf1d-43d8d7a06a5b",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-01-20T20:50:05.881",
    profit: -0.0034,
    barsHeld: 1
  },
  {
    id: "b9f28dd8-cf5b-48e4-ac0a-7d763bef8b3e",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-01-20T21:06:13.61",
    profit: -0.0006,
    barsHeld: 1
  },
  {
    id: "084326fa-0384-45ee-96ef-4f1d8e551a13",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-01-20T21:45:09.377",
    profit: -0.0006,
    barsHeld: 3
  },
  {
    id: "09e28c96-0ccf-4d5c-a488-dfb18d686189",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-01-20T22:05:02.868",
    profit: 0.0156,
    barsHeld: 1
  },
  {
    id: "00ce9563-d34e-40c9-b05f-699ec6db6174",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-01-20T22:25:32.774",
    profit: -0.0328,
    barsHeld: 2
  },
  {
    id: "e6937556-bf7d-422b-8809-c20f3bf6ac8e",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-01-20T22:46:24.519",
    profit: -0.0194,
    barsHeld: 1
  },
  {
    id: "0e13a8f9-d9ee-4252-b687-329c92e82e89",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-01-20T23:07:39.069",
    profit: 0.08,
    barsHeld: 3
  },
  {
    id: "9e462819-d90e-49ec-a189-42b575f19fdc",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-01-21T00:10:03.698",
    profit: -0.0072,
    barsHeld: 0
  },
  {
    id: "0074e4b7-6fb7-4f53-b584-d162b80b70c1",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-01-21T00:35:06.519",
    profit: -0.002952,
    barsHeld: 1
  },
  {
    id: "802a8581-897f-40d3-bcc4-c3b6e1080a64",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-01-21T00:56:24.105",
    profit: -0.0138,
    barsHeld: 2
  },
  {
    id: "844a773b-909d-4cf4-ab2e-a9eba7bf1e14",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-01-21T01:40:45.195",
    profit: 0.006,
    barsHeld: 4
  },
  {
    id: "25b3f3c9-32ce-435e-bcab-2eb5eb42cbea",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-01-21T02:15:14.742",
    profit: -0.014293,
    barsHeld: 0
  },
  {
    id: "cedbfa5a-a79c-4daa-a2b7-edf6a6dce44a",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-01-21T02:48:58.632",
    profit: -0.0066,
    barsHeld: 1
  },
  {
    id: "d6051858-6fdb-4c7a-8d58-9afeebb1fc0e",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-01-21T03:20:07.909",
    profit: 0.0016,
    barsHeld: 3
  },
  {
    id: "b3f88816-a9ce-4699-b391-97727aeb8b03",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-01-21T04:10:34.887",
    profit: 0.0006,
    barsHeld: 2
  },
  {
    id: "b33ffbab-dc19-4117-a1b3-fb2381301456",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-01-21T04:26:48.028",
    profit: 0.002037,
    barsHeld: 3
  },
  {
    id: "89a78a3f-6b48-4a97-8e89-aee532572d85",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-01-21T04:45:09.471",
    profit: 0.0178,
    barsHeld: 3
  },
  {
    id: "fae50919-4555-4ca0-a46c-655acbb3cabf",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-01-21T05:10:10.794",
    profit: -0.007,
    barsHeld: 1
  },
  {
    id: "3a756644-68e4-4234-9e61-8d128b144e72",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-01-21T05:30:07.808",
    profit: 0.0122,
    barsHeld: 3
  },
  {
    id: "f85e4f3d-8aa3-40bc-b21d-013c4bcc4d50",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-01-21T05:45:02.763",
    profit: -0.0166,
    barsHeld: 1
  },
  {
    id: "2a01a88d-93cc-47f4-be62-b54ffe0a3f10",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-01-21T05:55:06.103",
    profit: -0.025,
    barsHeld: 1
  },
  {
    id: "eab9b0ca-7b3a-4bee-877d-26be877f099a",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-01-21T06:30:07.837",
    profit: -0.009,
    barsHeld: 0
  },
  {
    id: "d80b205a-ef5b-45a4-8c08-677702b03e56",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-01-21T06:50:53.544",
    profit: 0.003,
    barsHeld: 2
  },
  {
    id: "7fa2911d-7cf7-4871-b311-072ea32b2fd6",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-01-21T07:30:09.144",
    profit: 0.0026,
    barsHeld: 2
  },
  {
    id: "569a9edc-4ed5-4425-b5de-f8aa9e3b8348",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-01-21T07:45:04.706",
    profit: 0.0218,
    barsHeld: 1
  },
  {
    id: "21fc14df-ef49-44b9-8e17-fd82255c83b5",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-01-21T07:58:40.075",
    profit: -0.0216,
    barsHeld: 2
  },
  {
    id: "4d2ad9ab-e53d-45ec-91af-2fd9728c4e7a",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-01-21T08:20:26.394",
    profit: 0.0156,
    barsHeld: 3
  },
  {
    id: "eab5c81a-89cb-40bf-9140-415902095185",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-01-21T08:50:08.233",
    profit: 0.0218,
    barsHeld: 2
  },
  {
    id: "7fb36081-6b39-4573-95d6-74e74327855a",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-01-21T09:05:41.212",
    profit: 0.0124,
    barsHeld: 2
  },
  {
    id: "f32233e7-6acc-448d-a717-649ff464f71a",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-01-21T09:45:13.021",
    profit: -0.006,
    barsHeld: 0
  },
  {
    id: "e44e2224-936d-4159-b81a-ddd0e05e5a22",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-01-21T10:00:08.179",
    profit: -0.0002,
    barsHeld: 2
  },
  {
    id: "89d71afa-d53f-4bd7-921d-b487d525e020",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-01-21T10:10:08.262",
    profit: -0.0002,
    barsHeld: 1
  },
  {
    id: "1750f269-965f-4f39-9b4d-7349b8c7a5f7",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-01-21T10:20:08.092",
    profit: -0.0002,
    barsHeld: 1
  },
  {
    id: "5c37d943-4d6d-4bd2-b4bb-b072d8235adb",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-01-21T10:37:31.08",
    profit: 0.0042,
    barsHeld: 2
  },
  {
    id: "be8b8d0f-fc69-4544-81de-a8d9bcc181cd",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-01-21T10:45:47.926",
    profit: -0.0062,
    barsHeld: 1
  },
  {
    id: "db85f2a8-91de-40d8-b920-d0dcb5cdb9eb",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-01-21T11:10:18.847",
    profit: -0.0052,
    barsHeld: 0
  },
  {
    id: "59f628e3-51a0-48ae-bdc6-859be4ac3208",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-01-21T11:31:56.583",
    profit: 0.0096,
    barsHeld: 3
  },
  {
    id: "5a8c82b6-f740-47a1-a450-8e1a00800c9d",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-01-21T12:00:07.733",
    profit: 0.0146,
    barsHeld: 3
  },
  {
    id: "79b444b2-7778-4a7c-bddc-81e3879013d4",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-01-21T12:10:07.884",
    profit: 0,
    barsHeld: 0
  },
  {
    id: "1c434cab-87f9-4080-961e-ac8584433e9b",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-01-21T12:20:31.395",
    profit: -0.0182,
    barsHeld: 2
  },
  {
    id: "7bfad799-a4e0-4e36-8b54-444a104c6048",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-01-21T12:42:04.94",
    profit: -0.0186,
    barsHeld: 1
  },
  {
    id: "e08b5a03-d206-438c-8d5e-974ef8ec3dd1",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-01-21T13:05:05.665",
    profit: 0.014,
    barsHeld: 2
  },
  {
    id: "91a543a4-3ee9-4198-89c0-9f966a190fa3",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-01-21T13:40:16.162",
    profit: -0.029,
    barsHeld: 2
  },
  {
    id: "cff59cbc-24c9-4cbf-805f-252e9091d7ad",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-01-21T13:59:41.385",
    profit: -0.0002,
    barsHeld: 2
  },
  {
    id: "29585e49-9b3d-4d39-9e7b-310d605ddb0d",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-01-21T14:06:05.496",
    profit: -0.0056,
    barsHeld: 1
  },
  {
    id: "a54e61df-8cc1-45a4-a614-a8c5e01dea30",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-01-21T15:26:12.222",
    profit: 0.0142,
    barsHeld: 3
  },
  {
    id: "c49f41f1-b338-4599-ad94-e6b682b67569",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-01-21T15:57:07.11",
    profit: 0.004539,
    barsHeld: 3
  },
  {
    id: "89b7134c-c7c3-4baf-97ad-42b5882e8a31",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-01-21T16:05:04.117",
    profit: -0.0088,
    barsHeld: 2
  },
  {
    id: "395596c5-da71-470b-9d52-10a54d81cb3e",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-01-21T16:48:08.114",
    profit: 0.009,
    barsHeld: 3
  },
  {
    id: "e7b48639-47f8-4dbb-87df-f2f879332094",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-01-21T17:25:17.715",
    profit: -0.0082,
    barsHeld: 0
  },
  {
    id: "b9ceaa11-9cbc-46f6-9965-fa354a494cc7",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-01-21T18:05:47.846",
    profit: 0.0046,
    barsHeld: 1
  },
  {
    id: "7e609fc3-562d-4e0d-9153-3837218390b8",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-01-21T18:25:06.763",
    profit: -0.0012,
    barsHeld: 0
  },
  {
    id: "9c86b815-d2d8-4be8-988c-490d1f55c076",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-01-21T18:44:13.556",
    profit: 0.001122,
    barsHeld: 2
  },
  {
    id: "8d8d86af-f4ba-48ae-a47b-83bcdcd30567",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-01-21T19:15:03.945",
    profit: -0.000006,
    barsHeld: 1
  },
  {
    id: "6a32b1dd-1c89-41b8-a810-270c1d082b84",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-01-21T19:55:06.774",
    profit: 0.161,
    barsHeld: 2
  },
  {
    id: "8eecdb77-eb7a-47ad-9bd9-6e65c0bb6813",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-01-21T20:30:03.711",
    profit: 0.113,
    barsHeld: 5
  },
  {
    id: "a2628444-eadd-4d40-b171-9d35133c98b1",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-01-21T21:10:02.951",
    profit: 0.0318,
    barsHeld: 1
  },
  {
    id: "c42d635b-4082-4eb2-b264-8463f09405ca",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-01-21T22:10:46.494",
    profit: -0.0084,
    barsHeld: 1
  },
  {
    id: "6120cfbf-da46-4d8f-b857-8f22e1137b74",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-01-21T22:25:03.746",
    profit: -0.0116,
    barsHeld: 1
  },
  {
    id: "2fd00e9c-fa8f-4838-ae0e-5dbd42d3b32d",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-01-21T23:15:07.917",
    profit: 0.0108,
    barsHeld: 2
  },
  {
    id: "5673837a-f1cb-4b31-9b0d-fd8cbb4f301d",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-01-22T00:15:16.903",
    profit: -0.015,
    barsHeld: 0
  },
  {
    id: "142441df-46cd-44da-a748-a408b07eca27",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-01-22T00:28:38.499",
    profit: -0.0142,
    barsHeld: 1
  },
  {
    id: "dcd7b633-06d1-43d1-acc8-583ff3fae6a4",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-01-22T00:45:58.811",
    profit: -0.0146,
    barsHeld: 0
  },
  {
    id: "ad982bec-6d9c-45ae-8a48-e02869267c33",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-01-22T00:58:21.085",
    profit: -0.00095,
    barsHeld: 1
  },
  {
    id: "ad37f4b2-b360-437c-83be-485033ccdad9",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-01-22T01:30:20.764",
    profit: 0.003,
    barsHeld: 1
  },
  {
    id: "0048271f-b462-4059-9d41-29527d0e5ace",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-01-22T02:39:49.117",
    profit: 0.0196,
    barsHeld: 3
  },
  {
    id: "251bdd54-a530-4caa-a0d7-897025bf6392",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-01-22T02:58:10.585",
    profit: -0.008,
    barsHeld: 1
  },
  {
    id: "26339c1d-850f-49af-bb4e-f50481fe4a93",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-01-22T03:22:59.511",
    profit: -0.001938,
    barsHeld: 1
  },
  {
    id: "4f19f68c-2880-46e7-aa6b-1f3465fb0f4d",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-01-22T03:46:02.694",
    profit: 0.0094,
    barsHeld: 3
  },
  {
    id: "0739c1d3-6cb6-45e9-9a57-e5d760e09c5b",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-01-22T04:13:00.243",
    profit: 0.000294,
    barsHeld: 2
  },
  {
    id: "18180cb8-90c4-4e86-87ce-c0faa5b677a3",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-01-22T05:00:19.007",
    profit: 0.0104,
    barsHeld: 7
  },
  {
    id: "869ac68e-3c33-4456-a749-9786edbfb4fd",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-01-22T05:37:19.223",
    profit: 0.0026,
    barsHeld: 2
  },
  {
    id: "11821fc1-8a0a-4f93-83ce-8f2428d439bb",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-01-22T05:50:26.039",
    profit: -0.0002,
    barsHeld: 2
  },
  {
    id: "31383451-bd25-4fa1-b8f2-65a0e646b91f",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-01-22T06:05:55.725",
    profit: 0.0022,
    barsHeld: 2
  },
  {
    id: "fb35db13-7be0-49f1-8a54-96b75c74d4ec",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-01-22T06:25:33.406",
    profit: 0.0028,
    barsHeld: 2
  },
  {
    id: "6dac74e3-91ff-4abd-9f08-c87f2f985b3c",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-01-22T06:50:48.892",
    profit: 0.0136,
    barsHeld: 1
  },
  {
    id: "6af5e526-38a6-40b9-a62b-13911ea4ef83",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-01-22T07:05:44.047",
    profit: 0.0138,
    barsHeld: 1
  },
  {
    id: "aaec2cae-8467-42ed-8500-177125dab495",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-01-22T07:30:15.85",
    profit: 0.0408,
    barsHeld: 2
  },
  {
    id: "4e038224-df5e-4a35-8564-63c49fc6efb0",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-01-22T08:00:08.588",
    profit: 0.006872,
    barsHeld: 5
  },
  {
    id: "3cfcc3c5-342e-49e4-9fa4-3894f6a0234d",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-01-22T08:50:55.489",
    profit: 0.085,
    barsHeld: 3
  },
  {
    id: "7a6220a4-505a-42b4-9577-e6a14d1d33bf",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-01-22T09:00:04.511",
    profit: -0.0242,
    barsHeld: 1
  },
  {
    id: "3e78e11b-e16f-4bdc-8552-0b855ac247f7",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-01-22T09:34:22.288",
    profit: -0.011,
    barsHeld: 2
  },
  {
    id: "29b8f7e0-1a5f-4b1d-9518-0d2b1cc4aeeb",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-01-22T10:04:20.463",
    profit: 0.0092,
    barsHeld: 2
  },
  {
    id: "1d5b838a-1d5c-43d5-9e8e-c188a488f2ee",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-01-22T10:26:00.578",
    profit: -0.0028,
    barsHeld: 2
  },
  {
    id: "2ef245e3-50d4-44f0-bc1a-a83e49946a3a",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-01-22T15:41:32.705",
    profit: -0.0002,
    barsHeld: 1
  },
  {
    id: "d2539244-654d-4a43-8a3a-e888e2ccf005",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-01-22T15:50:12.817",
    profit: -0.0012,
    barsHeld: 1
  },
  {
    id: "a338ebc4-856d-4212-9563-5fff233dcc12",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-01-22T16:03:55.29",
    profit: -0.001137,
    barsHeld: 1
  },
  {
    id: "bd2ee457-b066-4747-a227-68ed31036f9d",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-01-22T16:21:04.42",
    profit: 0.0006,
    barsHeld: 3
  },
  {
    id: "941baa27-cfa1-4555-8185-26e39a65afef",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-01-22T16:39:46.362",
    profit: -0.0024,
    barsHeld: 2
  },
  {
    id: "dbf23d67-8e59-4e20-a21a-26f457314e8b",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-01-22T16:59:05.349",
    profit: 0.0322,
    barsHeld: 3
  },
  {
    id: "ebf13159-dc06-4182-8144-1a95ad8839e1",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-01-22T17:05:05.795",
    profit: -0.0444,
    barsHeld: 0
  },
  {
    id: "598b5007-60f2-480a-be40-9c2e8056a96c",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-01-22T17:50:15.951",
    profit: -0.0114,
    barsHeld: 0
  },
  {
    id: "d860436b-1a92-41be-91fa-98c101c2c53d",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-01-22T18:10:41.548",
    profit: -0.0002,
    barsHeld: 1
  },
  {
    id: "8e325a2f-233b-45ab-a13b-9e8f5ebfe821",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-01-22T18:50:09.98",
    profit: -0.0006,
    barsHeld: 1
  },
  {
    id: "d376d365-b02b-4a8a-85e9-891b995edd05",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-01-22T21:00:06.389",
    profit: -0.0004,
    barsHeld: 1
  },
  {
    id: "6da35013-6008-42d8-8df9-01d059c840c1",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-01-22T21:35:04.599",
    profit: -0.0038,
    barsHeld: 2
  },
  {
    id: "fdf577b6-c1f4-4a70-88e0-3de40755403e",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-01-22T22:15:03.73",
    profit: -0.007,
    barsHeld: 0
  },
  {
    id: "719afa6d-e228-4a3f-ad96-1f23459e43a9",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-01-22T22:45:27.077",
    profit: -0.0048,
    barsHeld: 0
  },
  {
    id: "451213d2-c269-426d-bfbd-e6bfc6125fec",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-01-22T23:23:56.188",
    profit: 0.006986,
    barsHeld: 2
  },
  {
    id: "52d30e4b-25c3-4adf-bc6e-bbecb3bcb545",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-01-23T00:20:50.604",
    profit: 0.0018,
    barsHeld: 1
  },
  {
    id: "bb5a97a8-d6ad-489c-8a41-3b76ae1160d2",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-01-23T00:40:09.265",
    profit: -0.0016,
    barsHeld: 2
  },
  {
    id: "bf3ac4c8-ed3e-4694-b01d-3ed7ebd3a1d9",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-01-23T01:25:09.597",
    profit: -0.0062,
    barsHeld: 0
  },
  {
    id: "ec22668d-b8b7-43bc-bf41-c1a492f66832",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-01-23T01:47:58.132",
    profit: 0.043662,
    barsHeld: 3
  },
  {
    id: "a5e6a757-6a65-4bfa-8a90-e3d87725c6e1",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-01-23T02:15:03.03",
    profit: 0.0106,
    barsHeld: 4
  },
  {
    id: "5e760303-43c0-43a4-ad77-feb3223c288d",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-01-23T13:40:03.915",
    profit: -0.004,
    barsHeld: 0
  },
  {
    id: "59b12129-b4af-4519-8de9-c0d73322a2c2",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-01-23T13:55:36.015",
    profit: -0.0002,
    barsHeld: 2
  },
  {
    id: "a3fae3c1-9420-4b1f-ad31-9dd7dd0ad38d",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-01-23T14:15:08.858",
    profit: 0.0022,
    barsHeld: 2
  },
  {
    id: "4ea12f6d-5576-4284-8c5d-67205ec53304",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-01-23T14:50:03.734",
    profit: 0.0052,
    barsHeld: 2
  },
  {
    id: "cb70e92a-281a-4a64-9e1c-1a432a976855",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-01-23T15:46:44.643",
    profit: 0.01,
    barsHeld: 3
  },
  {
    id: "e14744af-1e73-4dc2-b781-9c6bfa6c5e1a",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-01-23T16:05:07.977",
    profit: -0.0078,
    barsHeld: 1
  },
  {
    id: "3e24d250-ca05-4e5c-bfa2-5656e9111202",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-01-23T16:20:19.623",
    profit: -0.0044,
    barsHeld: 2
  },
  {
    id: "dd059ad2-dbec-4941-9032-45942fcb0e6f",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-01-23T16:30:04.865",
    profit: -0.0178,
    barsHeld: 0
  },
  {
    id: "a11fd503-96dd-472f-8dd2-c54dfa6731fa",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-01-23T16:46:21.979",
    profit: 0.0094,
    barsHeld: 2
  },
  {
    id: "8e446c1e-174c-4b49-9eae-16df3d5e0270",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-01-23T17:20:06.204",
    profit: 0.018,
    barsHeld: 2
  },
  {
    id: "8d736d97-e531-4099-99ac-b68a42ce7128",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-01-23T18:10:09.771",
    profit: 0.0492,
    barsHeld: 4
  },
  {
    id: "1b302886-5570-4bab-a380-7a295bc238a9",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-01-23T19:25:02.557",
    profit: 0.01,
    barsHeld: 3
  },
  {
    id: "87506028-92e6-4183-9ea2-aa1a93b3b9cc",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-01-24T00:15:17.539",
    profit: 0.0592,
    barsHeld: 1
  },
  {
    id: "5b18e18d-aa8d-4aef-b829-2c18fb416570",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-01-24T01:05:15.027",
    profit: -0.005464,
    barsHeld: 0
  },
  {
    id: "adca17f9-327c-49ac-af05-acc0f69f892a",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-01-24T01:15:08.076",
    profit: -0.02,
    barsHeld: 2
  },
  {
    id: "130a132e-9914-4a0d-8e10-dee4b9ef005b",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-01-24T01:38:34.375",
    profit: 0.0218,
    barsHeld: 3
  },
  {
    id: "6be5ec30-687e-45c4-a473-bcff718a8dcc",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-01-24T02:10:04.76",
    profit: -0.001346,
    barsHeld: 0
  },
  {
    id: "32403e6a-6a89-41ae-b094-f07dfab43618",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-01-24T02:30:05.414",
    profit: 0.0306,
    barsHeld: 4
  },
  {
    id: "8a372cf0-1d6f-48a6-9714-6842971d5e05",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-01-24T02:45:33.801",
    profit: 0.0358,
    barsHeld: 1
  },
  {
    id: "6b1f0760-09d4-477b-8957-f0f596871c4d",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-01-24T03:00:34.864",
    profit: 0.0148,
    barsHeld: 2
  },
  {
    id: "e75c2ba5-7a8c-4aef-9dc6-f4311c143f02",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-01-24T03:35:03.428",
    profit: -0.0044,
    barsHeld: 2
  },
  {
    id: "48874bff-e9c1-4050-9eb5-cb0c4448e58d",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-01-24T03:50:07.905",
    profit: -0.0038,
    barsHeld: 0
  },
  {
    id: "08bf31e9-05f5-49c5-b786-1c13b4284c57",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-01-24T04:26:07.772",
    profit: -0.00176,
    barsHeld: 0
  },
  {
    id: "3be1c302-e0be-4043-9a97-4d8cb6752041",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-01-24T04:40:08.457",
    profit: 0.001,
    barsHeld: 2
  },
  {
    id: "992cc8dc-7168-493f-b995-f140901150dc",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-01-24T05:25:09.886",
    profit: 0.0236,
    barsHeld: 1
  },
  {
    id: "fdd2d73a-abbf-4cea-a886-557db38b5d33",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-01-24T06:15:26.745",
    profit: -0.006114,
    barsHeld: 0
  },
  {
    id: "9867c5c6-f0dd-499a-b42b-6b17f41e268c",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-01-24T06:31:27.235",
    profit: -0.0002,
    barsHeld: 3
  },
  {
    id: "7b4dc30b-c75f-4240-9f2b-3fc399483e81",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-01-24T07:00:03.488",
    profit: -0.0002,
    barsHeld: 1
  },
  {
    id: "dc9f85bb-c9ea-4c15-af2b-5dcef953b11d",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-01-24T07:10:14.651",
    profit: -0.0208,
    barsHeld: 0
  },
  {
    id: "f36e558c-17a9-4d5f-87c4-6270f97345ad",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-01-24T07:20:04.647",
    profit: -0.011,
    barsHeld: 1
  },
  {
    id: "7c8573f0-9453-47ca-8f35-f34f199f5c5b",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-01-24T08:10:23.882",
    profit: 0,
    barsHeld: 1
  },
  {
    id: "bf46e9db-1d27-4f2d-84e6-2622a0d17e48",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-01-24T08:45:47.327",
    profit: -0.0042,
    barsHeld: 1
  },
  {
    id: "604f5f53-6062-49dd-a1a2-dcc652ef9dd1",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-01-24T09:00:18.644",
    profit: 0,
    barsHeld: 2
  },
  {
    id: "58e970d1-1d68-4f44-bf4b-d8917e0f90d6",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-01-24T09:15:13.933",
    profit: -0.0054,
    barsHeld: 0
  },
  {
    id: "feae8740-6095-4d90-9a23-883988b71439",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-01-24T09:30:02.604",
    profit: 0.001582,
    barsHeld: 1
  },
  {
    id: "3770599e-23bf-4664-8d1a-a6e08bc571aa",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-01-24T09:40:03.952",
    profit: 0,
    barsHeld: 0
  },
  {
    id: "8e2b8626-f95a-40d7-819f-19cd7da3195f",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-01-24T09:50:04.952",
    profit: -0.0016,
    barsHeld: 0
  },
  {
    id: "c39ddfa7-0e8e-463e-85c3-a2088740abb0",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-01-24T10:01:52.269",
    profit: -0.01676,
    barsHeld: 1
  },
  {
    id: "58714b75-9cd7-4237-a42f-5e21b8270560",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-01-24T11:04:54.096",
    profit: 0.022,
    barsHeld: 2
  },
  {
    id: "21d9bebd-a447-4275-bd91-e06e726ce541",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-01-24T11:15:39.546",
    profit: -0.0068,
    barsHeld: 2
  },
  {
    id: "344baa8a-9b2f-4fa8-8499-7704f27558e9",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-01-24T11:25:03.653",
    profit: -0.014,
    barsHeld: 0
  },
  {
    id: "2fb4acb0-49eb-4001-846b-ffd9d7ac54c4",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-01-24T11:40:02.053",
    profit: 0.0952,
    barsHeld: 1
  },
  {
    id: "1baf68e8-8899-4487-8ca9-725f733fb091",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-01-24T12:05:04.149",
    profit: 0.0096,
    barsHeld: 2
  },
  {
    id: "67817b95-50bd-445b-9974-812ed70bca0b",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-01-24T13:01:34.421",
    profit: -0.0146,
    barsHeld: 1
  },
  {
    id: "1c53caae-4c26-4f54-8a6c-41a9940f74f4",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-01-24T18:10:02.098",
    profit: -0.0062,
    barsHeld: 2
  },
  {
    id: "2f1d38de-7e1f-4209-9c29-2bc59a3f208b",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-01-24T18:26:12.661",
    profit: -0.002,
    barsHeld: 2
  },
  {
    id: "c2509349-c7ab-42ae-b9bf-77b1b5cabb3d",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-01-24T19:25:51.317",
    profit: 0.0204,
    barsHeld: 3
  },
  {
    id: "bdec4fab-fc05-434a-b64a-8f5302082133",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-01-24T19:38:40.169",
    profit: -0.014,
    barsHeld: 1
  },
  {
    id: "02caafe1-97f1-4569-afde-4391504afff8",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-01-24T20:00:07.029",
    profit: -0.01,
    barsHeld: 2
  },
  {
    id: "1f417d6b-149f-4f66-9dab-9058184e169b",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-01-24T20:20:03.647",
    profit: -0.01332,
    barsHeld: 1
  },
  {
    id: "a532fd8b-8498-4514-9999-0c90e4d7311d",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-01-24T20:35:02.036",
    profit: 0.0062,
    barsHeld: 1
  },
  {
    id: "de3c5595-8ea6-463a-bcdf-ded8228d62f1",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-01-24T20:45:15.513",
    profit: -0.0298,
    barsHeld: 2
  },
  {
    id: "64103ff0-c1fb-40cb-bdf7-9638b0f47371",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-01-24T21:20:05.786",
    profit: -0.003476,
    barsHeld: 0
  },
  {
    id: "a9a8707f-b220-4475-8cbd-b52650acb3b3",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-01-24T21:30:03.965",
    profit: -0.000056,
    barsHeld: 0
  },
  {
    id: "cfbe8d2c-37a9-47a0-8cef-76ed4518729b",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-01-28T19:20:58.961",
    profit: 0.974,
    barsHeld: 1122
  },
  {
    id: "8526eecf-735a-4698-b308-0ef0d853a9b5",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-01-28T19:57:53.483",
    profit: 0.0618,
    barsHeld: 5
  },
  {
    id: "518a88ed-b013-4fe4-85da-b13cff6a02a0",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-01-28T20:15:04.903",
    profit: 0.0198,
    barsHeld: 2
  },
  {
    id: "ac5f5ce0-dffc-4352-b0de-e00fbf9ce2da",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-01-28T20:45:08.541",
    profit: -0.0352,
    barsHeld: 1
  },
  {
    id: "016987be-5132-4d1e-a54d-15e9dfb086d5",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-01-28T21:24:45.866",
    profit: 0.0016,
    barsHeld: 3
  },
  {
    id: "1762c50d-d244-405d-abd8-364d9178287b",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-01-28T21:41:20.266",
    profit: -0.0084,
    barsHeld: 1
  },
  {
    id: "c0001d02-547b-484e-b360-066ed55d5f0d",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-01-28T22:26:21.38",
    profit: -0.002514,
    barsHeld: 1
  },
  {
    id: "38411476-1847-4300-9cce-27f3e2397d61",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-01-28T23:00:03.958",
    profit: 0.117,
    barsHeld: 5
  },
  {
    id: "fd25cf95-8edd-4d53-b5b1-332fc34542e4",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-01-29T01:20:02.187",
    profit: 0.3956,
    barsHeld: 17
  },
  {
    id: "6571957d-3485-45fe-8a92-0ca654d8005b",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-01-29T03:15:02.868",
    profit: -0.022995,
    barsHeld: 1
  },
  {
    id: "c08c4f04-468c-4e5e-855a-eb59be17ae5a",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-01-29T03:45:16.209",
    profit: -0.00476,
    barsHeld: 1
  },
  {
    id: "51779f00-f2fa-4e84-8652-6c7173eaa814",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-01-29T04:15:03.402",
    profit: -0.0004,
    barsHeld: 3
  },
  {
    id: "1cb263d8-8992-4c9b-9448-2f569ecf33e1",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-01-29T04:46:20.442",
    profit: 0,
    barsHeld: 1
  },
  {
    id: "74933d20-6f7e-42f6-91dc-a1dee912b8c6",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-01-29T05:31:38.028",
    profit: 0.0352,
    barsHeld: 5
  },
  {
    id: "fdf9b898-010e-487b-93b6-5c93f57649fc",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-01-29T05:40:43.3",
    profit: -0.026097,
    barsHeld: 2
  },
  {
    id: "afae90b6-8153-433e-a397-7803b247f383",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-01-29T06:05:11.72",
    profit: -0.005297,
    barsHeld: 0
  },
  {
    id: "cd560c0e-b9b5-4699-b1c1-0d91f34c4d91",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-01-29T06:38:48.405",
    profit: 0.0102,
    barsHeld: 4
  },
  {
    id: "956a38cb-88b4-436c-bc44-eec91c77e01f",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-01-29T06:45:04.862",
    profit: -0.0166,
    barsHeld: 0
  },
  {
    id: "94c2112f-a53d-4cd0-a294-7fb20a575a7a",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-01-29T07:10:03.825",
    profit: 0.0082,
    barsHeld: 2
  },
  {
    id: "62dfb280-12a8-4538-b0ef-0ea375f17887",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-01-29T07:49:45.934",
    profit: -0.0072,
    barsHeld: 2
  },
  {
    id: "77fe3919-0e69-4e8b-a56a-1b4fd97ae010",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-01-29T08:05:37.426",
    profit: -0.0084,
    barsHeld: 2
  },
  {
    id: "eeba485b-0f69-4dcc-94b1-9c8b85669c18",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-01-29T08:15:05.792",
    profit: -0.0156,
    barsHeld: 0
  },
  {
    id: "cf421b6a-16f4-42ec-ae74-1aa39512b8b0",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-01-29T08:30:13.183",
    profit: -0.015348,
    barsHeld: 1
  },
  {
    id: "b30f0eeb-5a17-4f9d-93eb-e39fbcd1f77f",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-01-29T08:48:33.111",
    profit: -0.001,
    barsHeld: 2
  },
  {
    id: "120f784c-a198-4d62-b347-133b077caa70",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-01-29T09:00:12.783",
    profit: -0.0118,
    barsHeld: 0
  },
  {
    id: "1161ea95-d615-4951-971d-dbb99956ae5a",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-01-29T09:32:08.169",
    profit: -0.0052,
    barsHeld: 3
  },
  {
    id: "9ab00e2c-b629-4bde-85fa-c12bf1af761a",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-01-29T09:45:26.359",
    profit: -0.0298,
    barsHeld: 2
  },
  {
    id: "8755b950-730e-4d2b-a696-3e3ccab06977",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-01-29T10:00:12.445",
    profit: 0.0052,
    barsHeld: 2
  },
  {
    id: "c3fc4c94-b1a1-4661-b072-3e5d16cebc6c",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-01-29T10:20:05.855",
    profit: -0.118,
    barsHeld: 0
  },
  {
    id: "8abd7952-e050-4ffd-8449-0f11072108f8",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-01-29T10:40:24.138",
    profit: 0.0008,
    barsHeld: 4
  },
  {
    id: "c0ed0635-2fd4-41ba-b559-e5b5ba55d7a5",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-01-29T11:01:37.502",
    profit: 0.064,
    barsHeld: 3
  },
  {
    id: "08cac3ee-0040-4557-9c1c-fe0bf3fe2725",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-01-29T11:20:04.803",
    profit: 0.046201,
    barsHeld: 2
  },
  {
    id: "a24bd548-bd9f-4136-9b04-3fe90ea32da5",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-01-29T11:54:00.585",
    profit: -0.057,
    barsHeld: 3
  },
  {
    id: "66c84648-d58e-4a1e-bdc4-6f9d772ba82a",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-01-29T13:25:55.936",
    profit: 0.0834,
    barsHeld: 3
  },
  {
    id: "0c297fa1-2cb5-4b25-9e80-c1070c7ee080",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-01-29T14:32:29.213",
    profit: 0.009,
    barsHeld: 2
  },
  {
    id: "106684a2-3713-42fb-ac30-f409cfaf9a05",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-01-29T15:20:02.101",
    profit: 0.0284,
    barsHeld: 3
  },
  {
    id: "75318273-a955-4b8e-a5a9-ffa561be5b89",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-01-29T15:55:04.708",
    profit: -0.042,
    barsHeld: 0
  },
  {
    id: "21f65ab8-b038-484b-8485-ba982634505d",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-01-29T16:06:39.081",
    profit: -0.0316,
    barsHeld: 1
  },
  {
    id: "669b8b48-0da6-41c2-9570-ca16a015eb97",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-01-29T16:30:03.643",
    profit: 0.046,
    barsHeld: 3
  },
  {
    id: "dba48acd-9eff-4977-a29a-0f797463a720",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-01-29T17:01:58.417",
    profit: 0.016681,
    barsHeld: 3
  },
  {
    id: "6fc843b1-728f-440e-ad80-216fb9ad5594",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-01-29T17:30:07.945",
    profit: 0.011005,
    barsHeld: 1
  },
  {
    id: "5a3bcddc-d56a-4b04-9633-647fa35df65e",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-01-29T18:25:02.827",
    profit: -0.0036,
    barsHeld: 0
  },
  {
    id: "fbde50d3-c2fc-4b60-8254-f172f162b6f7",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-01-29T18:40:02.695",
    profit: -0.0102,
    barsHeld: 0
  },
  {
    id: "55c54c4f-74a2-4db9-aae7-d8101a4a0680",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-01-29T18:51:36.077",
    profit: 0,
    barsHeld: 1
  },
  {
    id: "e27773b0-2512-43ef-8e63-aa9beac40da6",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-01-29T19:05:53.65",
    profit: -0.023,
    barsHeld: 3
  },
  {
    id: "9eefff68-0822-47a5-9886-f5ce6ef5eeb7",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-01-29T19:15:23.948",
    profit: 0,
    barsHeld: 1
  },
  {
    id: "945c4b7a-3e07-4a0d-a7bc-72e768914b3d",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-01-29T19:53:32.496",
    profit: 0.0286,
    barsHeld: 3
  },
  {
    id: "fb18f352-f06b-49a7-851a-96d04c121618",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-01-29T21:10:03.698",
    profit: 0.0036,
    barsHeld: 2
  },
  {
    id: "3648e320-30f1-44b3-82b3-8060fcf04207",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-01-29T21:22:10.581",
    profit: -0.022,
    barsHeld: 1
  },
  {
    id: "7503cb61-e26c-401c-8a22-9ce11fbddd4d",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-01-29T22:49:37.026",
    profit: 0.002124,
    barsHeld: 3
  },
  {
    id: "55a46dfc-5b10-42b4-b90d-231d3a4b5ce2",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-01-30T00:03:56.532",
    profit: 0.0442,
    barsHeld: 2
  },
  {
    id: "30f84f2d-3e25-47ae-ab00-b59a37588921",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-01-30T00:39:18.442",
    profit: 0.0642,
    barsHeld: 5
  },
  {
    id: "773115fe-64a2-481b-9fb1-834df272cccb",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-01-30T01:10:42.921",
    profit: -0.0284,
    barsHeld: 3
  },
  {
    id: "99eb349d-d516-4da2-9248-b4ed749ca941",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-01-30T01:21:16.303",
    profit: -0.0372,
    barsHeld: 1
  },
  {
    id: "c882c491-118f-4418-a837-d907a3836b57",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-01-30T01:55:02.99",
    profit: -0.0246,
    barsHeld: 1
  },
  {
    id: "d64f326a-d8f1-458c-8bcb-ad84a25d684e",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-01-30T02:05:11.602",
    profit: -0.024,
    barsHeld: 1
  },
  {
    id: "27248834-19b4-4f4e-960c-5678629c0158",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-01-30T02:30:47.98",
    profit: -0.0002,
    barsHeld: 1
  },
  {
    id: "70e7da94-772d-4f31-bd18-cd3026444f9c",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-01-30T02:45:08.94",
    profit: 0.0086,
    barsHeld: 1
  },
  {
    id: "352ca3bb-7e8f-4952-a3c5-f361a3e77227",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-01-30T03:08:12.149",
    profit: -0.01,
    barsHeld: 2
  },
  {
    id: "ed301b97-010c-48ba-bddb-ef9b3bf9cc90",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-01-30T04:32:22.499",
    profit: -0.0022,
    barsHeld: 1
  },
  {
    id: "6f5e9125-d43b-4a09-a1c5-e3ec33862501",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-01-30T04:44:13.962",
    profit: -0.0162,
    barsHeld: 1
  },
  {
    id: "71393713-909e-427a-8f57-d0823ba5dafe",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-01-30T05:24:55.622",
    profit: -0.0106,
    barsHeld: 1
  },
  {
    id: "a9adf08c-34a4-4fa9-9537-4e4215da3785",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-01-30T05:35:03.628",
    profit: -0.0126,
    barsHeld: 2
  },
  {
    id: "4e6c1b25-d527-4ca1-894c-a2ae22814a0f",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-01-30T06:05:02.948",
    profit: 0.018126,
    barsHeld: 4
  },
  {
    id: "95d0374f-db63-4baa-b1f9-7f1fe5adcb82",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-01-30T06:35:02.847",
    profit: -0.014502,
    barsHeld: 0
  },
  {
    id: "1eaf2f14-53f1-4af3-9a89-4dd17094b276",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-01-30T07:36:34.718",
    profit: 0.0338,
    barsHeld: 4
  },
  {
    id: "87d592f8-aba3-4dd0-9164-a5b4a6b5a903",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-01-30T07:50:09.991",
    profit: 0.0108,
    barsHeld: 1
  },
  {
    id: "7058f15b-54a2-4247-b335-ae2ba18eb377",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-01-30T08:01:10.892",
    profit: -0.0122,
    barsHeld: 1
  },
  {
    id: "d78e5642-730e-4799-ba5f-8e11a0b92ec6",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-01-30T08:18:14.147",
    profit: -0.011,
    barsHeld: 2
  },
  {
    id: "e08f991f-60c5-4f91-b338-160292a984f4",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-01-30T08:25:19.279",
    profit: -0.0344,
    barsHeld: 2
  },
  {
    id: "5faf8152-9a49-4589-b096-0768e62a1071",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-01-30T08:36:16.671",
    profit: -0.01234,
    barsHeld: 1
  },
  {
    id: "4bb81a2c-c8d5-4e00-8ce4-f091a39c4e5d",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-01-30T08:48:11.611",
    profit: 0,
    barsHeld: 1
  },
  {
    id: "3563c684-e550-4aa3-8b84-d34b6b448b01",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-01-30T08:55:22.946",
    profit: -0.0002,
    barsHeld: 0
  },
  {
    id: "cd629205-8719-410e-9313-928522142334",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-01-30T09:25:48.862",
    profit: 0.0452,
    barsHeld: 3
  },
  {
    id: "8e1c960e-b9df-43dc-b337-38abbaf9875f",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-01-30T10:05:04.961",
    profit: -0.005,
    barsHeld: 0
  },
  {
    id: "8a4e8265-e5f5-4b8a-9819-ff92aaeb9cc4",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-01-30T10:50:08.807",
    profit: -0.0086,
    barsHeld: 3
  },
  {
    id: "09370531-fe49-4611-9c4c-06469bd4188f",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-01-30T11:00:50.127",
    profit: -0.0002,
    barsHeld: 1
  },
  {
    id: "04b56769-24d1-4ae7-b4e2-402ddcdcd107",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-01-30T11:20:37.993",
    profit: 0.0114,
    barsHeld: 2
  },
  {
    id: "1e9f84f8-be8c-4be5-af6e-3e3bdbd15c17",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-01-30T11:38:38.319",
    profit: -0.039669,
    barsHeld: 3
  },
  {
    id: "40226652-5479-4c4d-b6ae-2a00ad66bc4f",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-01-30T11:50:11.852",
    profit: -0.0026,
    barsHeld: 0
  },
  {
    id: "75716970-6f57-46a8-8299-ef2b41e1e802",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-01-30T12:10:13.004",
    profit: -0.0126,
    barsHeld: 0
  },
  {
    id: "ca77139e-06eb-466c-87e2-11fad8eac143",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-01-30T12:25:23.395",
    profit: 0.0144,
    barsHeld: 2
  },
  {
    id: "ccc649d9-ead1-4ede-b65a-502e0f4d927f",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-01-30T12:35:02.721",
    profit: -0.0254,
    barsHeld: 0
  },
  {
    id: "6b9381ac-1b88-4657-9b05-ef77152c9f4b",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-01-30T12:45:16.674",
    profit: -0.0162,
    barsHeld: 0
  },
  {
    id: "959c8270-ddc9-4d89-93fc-571fa5b5864f",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-01-30T13:10:07.848",
    profit: -0.005328,
    barsHeld: 1
  },
  {
    id: "8c4dd653-f416-491d-9144-601692a4f01d",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-01-30T13:35:22.699",
    profit: -0.019,
    barsHeld: 1
  },
  {
    id: "fdf7b59a-e751-4cb3-bec4-4fa04d58b0b0",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-01-30T13:51:43.13",
    profit: -0.0018,
    barsHeld: 2
  },
  {
    id: "b1cfac1c-63ed-4f6b-86ad-fcf37a0961bf",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-01-30T14:05:18.232",
    profit: -0.0858,
    barsHeld: 1
  },
  {
    id: "5d271c47-bca3-4320-9935-e1faaf539705",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-01-30T14:15:02.789",
    profit: -0.0946,
    barsHeld: 1
  },
  {
    id: "a25c4808-3cd6-4bc9-aeec-23d656df68f3",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-01-30T15:18:29.493",
    profit: -0.0232,
    barsHeld: 2
  },
  {
    id: "6e8f1792-6cde-43a7-9101-7073c12ee9e5",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-01-30T15:30:02.8",
    profit: -0.0028,
    barsHeld: 1
  },
  {
    id: "b3b40ce9-4fd1-4be1-b0e8-522bb90b7442",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-01-30T15:40:19.631",
    profit: -0.011019,
    barsHeld: 1
  },
  {
    id: "70cd76d0-ca26-4567-acae-00b5cd60f1ea",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-01-30T15:56:52.091",
    profit: 0,
    barsHeld: 2
  },
  {
    id: "e6c977c1-3e0b-4254-b4c4-b3599045b395",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-01-30T16:05:02.019",
    profit: -0.0128,
    barsHeld: 1
  },
  {
    id: "d78d5834-008d-4d6e-a220-fc778056dd0f",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-01-30T16:19:51.901",
    profit: -0.0044,
    barsHeld: 1
  },
  {
    id: "c024dddf-d21c-454a-9b6a-3117fb5b3994",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-01-30T16:29:56.641",
    profit: -0.051,
    barsHeld: 1
  },
  {
    id: "e6fb1cdd-9099-429e-a94d-8e42a077d5fc",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-01-30T16:40:58.498",
    profit: 0.1524,
    barsHeld: 2
  },
  {
    id: "6a328f80-8298-4317-9362-21f27ab0fd8e",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-01-30T17:39:47.053",
    profit: -0.0084,
    barsHeld: 4
  },
  {
    id: "95836863-214e-4ac2-9852-97d012b29598",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-01-30T19:21:23.053",
    profit: 0.0028,
    barsHeld: 2
  },
  {
    id: "0a9b1861-7107-4725-8c47-5910a30c1f0e",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-01-30T19:43:28.913",
    profit: -0.0388,
    barsHeld: 2
  },
  {
    id: "77799404-f676-438b-b11b-46ccddef6a6e",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-01-30T20:06:57.284",
    profit: -0.021355,
    barsHeld: 1
  },
  {
    id: "f3d544fb-ca8c-4807-84e2-4c13b37946fb",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-01-30T20:30:03.806",
    profit: 0.0182,
    barsHeld: 1
  },
  {
    id: "97d16896-a42b-41ef-813c-a4bd6f202a5d",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-01-30T20:46:47.091",
    profit: 0.033,
    barsHeld: 2
  },
  {
    id: "aedea417-6af5-4319-8b36-761eba00e1db",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-01-30T21:40:02.041",
    profit: -0.0048,
    barsHeld: 2
  },
  {
    id: "3d403496-6e4b-4881-8466-cf79aed8ca05",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-01-30T22:08:28.425",
    profit: -0.002381,
    barsHeld: 1
  },
  {
    id: "4aab4af1-c7cc-4ca9-bfa0-fc496a00810c",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-01-30T22:15:03.617",
    profit: -0.021,
    barsHeld: 2
  },
  {
    id: "4dc9445e-8db8-4ff8-be0c-88b7f98add89",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-01-30T23:05:03.77",
    profit: 0.007,
    barsHeld: 3
  },
  {
    id: "29b15382-661d-44d4-979d-5993cec3e2ff",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-01-30T23:20:02.972",
    profit: -0.034,
    barsHeld: 0
  },
  {
    id: "5ab7c5e7-a6c1-4209-b6dc-c1c4caade900",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-01-30T23:48:05.152",
    profit: 0.0604,
    barsHeld: 3
  },
  {
    id: "67c8939f-f240-4466-8b25-f3b774df96eb",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-01-31T00:55:11.912",
    profit: -0.0106,
    barsHeld: 0
  },
  {
    id: "461562fd-fab7-4080-9b44-6e62f3ff7d47",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-01-31T01:05:47.109",
    profit: -0.012782,
    barsHeld: 1
  },
  {
    id: "bc80fb2a-1fbb-436a-ba4e-b39ef56a9c32",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-01-31T01:43:53.816",
    profit: -0.0476,
    barsHeld: 1
  },
  {
    id: "dfa96c6c-3d36-4c8a-b30e-96d8df6bce28",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-01-31T02:25:25.257",
    profit: 0.0558,
    barsHeld: 3
  },
  {
    id: "88a2883f-9cd9-4101-b2dc-50072b76303c",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-01-31T03:20:06.357",
    profit: 0.0216,
    barsHeld: 3
  },
  {
    id: "9a328cbb-683f-4a73-8f11-b4dc51ff8fd9",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-01-31T03:40:09.832",
    profit: -0.015317,
    barsHeld: 1
  },
  {
    id: "962994ba-5053-4e40-835b-2f264e45b562",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-01-31T03:50:15.212",
    profit: -0.0086,
    barsHeld: 1
  },
  {
    id: "53370ab7-0a66-4476-967b-e6e11029f72c",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-01-31T04:17:51.015",
    profit: 0.0186,
    barsHeld: 3
  },
  {
    id: "8281dc4d-f6c8-4efa-b1b4-c98cd06777b8",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-01-31T05:30:03.703",
    profit: -0.004027,
    barsHeld: 0
  },
  {
    id: "5b29ccd2-ac6b-4f8d-add7-6e41deead1e2",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-01-31T06:09:00.097",
    profit: 0.102,
    barsHeld: 6
  },
  {
    id: "adea65d0-ac20-463d-9f0c-ad143f1012a4",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-01-31T09:45:06.996",
    profit: -0.0358,
    barsHeld: 0
  },
  {
    id: "6dedcd09-9384-4ade-81ef-c6394dac259b",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-01-31T10:05:25.731",
    profit: -0.007,
    barsHeld: 1
  },
  {
    id: "03dc473b-5905-4667-8015-ccccb79b0174",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-01-31T10:26:28.053",
    profit: -0.007,
    barsHeld: 2
  },
  {
    id: "fe167526-0d47-4884-aa58-430912f62ac6",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-01-31T10:45:34.323",
    profit: 0.0046,
    barsHeld: 3
  },
  {
    id: "4c6cf674-b733-47ef-9c11-7ec667b418ee",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-01-31T10:55:51.483",
    profit: -0.0684,
    barsHeld: 2
  },
  {
    id: "690dee41-e840-4c95-9a96-ef5579eec0dc",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-01-31T12:15:02.021",
    profit: -0.018334,
    barsHeld: 0
  },
  {
    id: "7f9adcbc-c88c-4434-a1ee-f871b94b7f73",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-01-31T12:33:36.139",
    profit: -0.019006,
    barsHeld: 1
  },
  {
    id: "df99328f-fd59-4122-8312-a9cf9249b2ea",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-01-31T12:53:24.545",
    profit: -0.0192,
    barsHeld: 2
  },
  {
    id: "584c7ec3-c789-42a4-a2bc-632ad4ce6ddc",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-01-31T17:00:48.404",
    profit: 0.0318,
    barsHeld: 4
  },
  {
    id: "80da1587-2a09-4a6c-bf75-f42d9125023d",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-01-31T17:31:15.214",
    profit: -0.011756,
    barsHeld: 2
  },
  {
    id: "95944631-8fb3-4008-b9aa-85bc8cbe703a",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-01-31T17:55:11.969",
    profit: -0.001787,
    barsHeld: 1
  },
  {
    id: "1088e4cf-1744-4c61-8d29-213f90cb3e74",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-01-31T18:05:14.688",
    profit: -0.005529,
    barsHeld: 2
  },
  {
    id: "f50a9905-46ad-4069-bbec-61179955fc52",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-01-31T18:21:43.039",
    profit: -0.0164,
    barsHeld: 1
  },
  {
    id: "553c0a19-d412-4b76-afb5-291a0a4b8c34",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-01-31T19:15:03.654",
    profit: -0.0298,
    barsHeld: 2
  },
  {
    id: "dd9665c7-f096-4d9a-ade9-21b363b85c11",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-01-31T20:03:34.012",
    profit: -0.0194,
    barsHeld: 1
  },
  {
    id: "f815db5f-95b1-4e3a-be6b-982ca4102ef8",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-01-31T20:15:21.931",
    profit: 0.016011,
    barsHeld: 1
  },
  {
    id: "a5c8764c-01bd-4c4c-bcc3-d67cbdf9809c",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-01-31T20:27:27.995",
    profit: -0.0192,
    barsHeld: 1
  },
  {
    id: "6919e2f5-b1da-4e05-b254-307c15bb8849",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-01-31T21:25:27.536",
    profit: 0.0126,
    barsHeld: 3
  },
  {
    id: "6c19a2fc-af75-4756-84b6-ace5140bfedf",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-01-31T21:51:56.088",
    profit: 0.0264,
    barsHeld: 3
  },
  {
    id: "d2804ee1-a81c-4a9e-99a0-6b4616c69749",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-01-31T22:25:03.69",
    profit: 0.0224,
    barsHeld: 5
  },
  {
    id: "fac65f76-3c2e-4ccd-aaf5-d79798246d50",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-01-31T22:50:02.899",
    profit: 0.0136,
    barsHeld: 1
  },
  {
    id: "8f68dba6-0375-465b-a04d-1a550ffacb3a",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-01-31T23:36:38.279",
    profit: -0.008974,
    barsHeld: 2
  },
  {
    id: "f0d61952-7857-4b53-85a2-9d86da93b44c",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-01-31T23:50:10.039",
    profit: -0.0402,
    barsHeld: 0
  },
  {
    id: "edaddaf0-e229-4f2d-84f3-ed8268033a7e",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-02-01T00:00:05.716",
    profit: -0.0384,
    barsHeld: 2
  },
  {
    id: "57a4a7ab-df9c-4efe-be60-21ca20186c2b",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-02-01T00:47:05.866",
    profit: 0.0068,
    barsHeld: 2
  },
  {
    id: "a4d0f24b-09d5-423f-aaf3-5a28ef19bcf6",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-02-01T01:20:04.161",
    profit: 0.0046,
    barsHeld: 2
  },
  {
    id: "f7d12ed7-e8e1-4659-bea5-d1cc5caf8779",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-02-01T01:35:05.005",
    profit: -0.0428,
    barsHeld: 0
  },
  {
    id: "371615b9-d932-4669-94ae-21045b33d428",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-02-01T02:06:03.491",
    profit: -0.004289,
    barsHeld: 2
  },
  {
    id: "e4913a2d-d78a-4888-b3b7-e875893043b9",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-02-01T02:20:03.661",
    profit: -0.0034,
    barsHeld: 1
  },
  {
    id: "74a954e5-95c1-482e-8310-775594df9d60",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-02-01T03:25:03.094",
    profit: -0.0062,
    barsHeld: 2
  },
  {
    id: "23411185-7eaf-493b-a1a2-32dd5ed959e5",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-02-01T03:45:26.898",
    profit: -0.0216,
    barsHeld: 1
  },
  {
    id: "97d18ae7-c710-4cdd-b69f-7639edb5ed23",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-02-01T03:56:10.569",
    profit: -0.0128,
    barsHeld: 1
  },
  {
    id: "b97cd858-90ba-44d3-95f5-b8c17c316674",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-02-01T04:05:09.642",
    profit: -0.033481,
    barsHeld: 0
  },
  {
    id: "221fe1ef-aaa5-45a7-b959-ae181abe0264",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-02-01T04:36:18.929",
    profit: -0.0246,
    barsHeld: 0
  },
  {
    id: "170ca9fe-8a00-4d2f-9721-49dcad5859cf",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-02-01T05:05:02.127",
    profit: 0.021319,
    barsHeld: 4
  },
  {
    id: "60968043-425b-4031-8e2c-6bbe39b4704f",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-02-01T05:45:54.621",
    profit: -0.002803,
    barsHeld: 1
  },
  {
    id: "390c3a4a-3609-459d-b47f-f8dc2d449bc8",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-02-01T06:15:04.988",
    profit: 0.0208,
    barsHeld: 4
  },
  {
    id: "76f82fec-df72-4baa-a038-2c745471ee8d",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-02-01T06:50:04.525",
    profit: -0.0022,
    barsHeld: 2
  },
  {
    id: "a7ac7e84-407d-4974-8fb0-906dc484c0d2",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-02-01T07:23:06.101",
    profit: 0.0474,
    barsHeld: 3
  },
  {
    id: "bc693de9-21a0-4c56-9f3f-621bcae12c49",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-02-01T08:12:01.131",
    profit: 0.0146,
    barsHeld: 3
  },
  {
    id: "3449e560-54dd-40ca-a621-c68ab14073e5",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-02-01T08:47:13.826",
    profit: 0.0346,
    barsHeld: 4
  },
  {
    id: "f532df85-9ff8-43ed-b1f2-ee6a785eb797",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-02-01T09:20:21.539",
    profit: 0.0156,
    barsHeld: 4
  },
  {
    id: "be5a972d-d869-421b-b6a9-40043027b1ff",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-02-01T10:10:02.017",
    profit: 0.0268,
    barsHeld: 3
  },
  {
    id: "a5ff293a-834b-470d-95af-fb17e4524d85",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-02-01T10:46:16.123",
    profit: 0.013,
    barsHeld: 3
  },
  {
    id: "f9472cb4-ae0c-4120-9d35-dcb148c312b5",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-02-01T11:23:55.586",
    profit: 0.0108,
    barsHeld: 2
  },
  {
    id: "e71a76d9-be00-4f4f-8d70-f77c08ecad83",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-02-01T11:41:00.543",
    profit: 0.0232,
    barsHeld: 3
  },
  {
    id: "ef162493-d6d5-4d3e-aaa0-a8e0caae60fb",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-02-01T11:56:16.091",
    profit: -0.009,
    barsHeld: 2
  },
  {
    id: "7c5d48fc-d33f-482d-bc25-259e9788117e",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-02-01T12:41:17.283",
    profit: 0.0238,
    barsHeld: 2
  },
  {
    id: "96490295-9647-42b6-bf8a-8f3a051e5743",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-02-01T13:02:01.676",
    profit: 0.003552,
    barsHeld: 3
  },
  {
    id: "ed01f9d8-9003-4065-8d02-e48e70a69bfc",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-02-01T13:30:05.91",
    profit: 0.0142,
    barsHeld: 4
  },
  {
    id: "b9a5d2da-5d91-492b-b87b-747a33ee197e",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-02-01T13:58:14.464",
    profit: -0.0208,
    barsHeld: 1
  },
  {
    id: "7b3b271a-73cc-4f60-8d4b-5e00b71c23d0",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-02-01T14:15:05.77",
    profit: 0.0358,
    barsHeld: 2
  },
  {
    id: "76840c27-9c66-40e9-85be-0e8d35e12756",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-02-01T15:01:40.49",
    profit: -0.003,
    barsHeld: 3
  },
  {
    id: "cd57a4b7-76a4-44f9-a949-31f737b2f4d5",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-02-01T15:20:32.665",
    profit: 0.007196,
    barsHeld: 2
  },
  {
    id: "784a9043-8361-4b1e-8582-b4c2c0a58063",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-02-01T16:06:41.806",
    profit: -0.0268,
    barsHeld: 2
  },
  {
    id: "2dbd2273-6550-413a-af01-b1bbe43f9420",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-02-01T16:40:03.804",
    profit: 0.0344,
    barsHeld: 1
  },
  {
    id: "a9a03e47-2116-4aa5-9fcb-8156726d6c1a",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-02-01T17:35:29.231",
    profit: 0.0144,
    barsHeld: 3
  },
  {
    id: "5742cfc0-d066-4be4-83fc-a952e223defc",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-02-01T18:50:07.19",
    profit: 0.0198,
    barsHeld: 3
  },
  {
    id: "4ea6da04-058d-4714-b91a-9e6f59b6a054",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-02-01T19:30:06.759",
    profit: -0.008753,
    barsHeld: 0
  },
  {
    id: "9958eddd-dd54-456f-b402-59a73e71aea4",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-02-01T20:01:55.195",
    profit: -0.001,
    barsHeld: 2
  },
  {
    id: "ae313bc4-5ac1-4531-8012-610236f43e1d",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-02-01T20:11:38.111",
    profit: -0.0008,
    barsHeld: 1
  },
  {
    id: "1d2b7c67-8462-466a-8569-b2fd3060653a",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-02-01T20:30:10.937",
    profit: 0.003,
    barsHeld: 1
  },
  {
    id: "bfdeb593-5154-4f2c-9281-59ae1d73e9d9",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-02-01T20:40:23.563",
    profit: -0.0006,
    barsHeld: 1
  },
  {
    id: "a937bd0e-8638-42e3-980b-f9577bc9b0b7",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-02-01T21:54:10.325",
    profit: 0.007116,
    barsHeld: 2
  },
  {
    id: "c87d5799-71f8-4b98-baf1-aa35116b53df",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-02-01T22:22:23.606",
    profit: 0.032782,
    barsHeld: 4
  },
  {
    id: "b1e94cd1-2a06-4bda-b1e5-eb2f50de5105",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-02-01T22:40:02.969",
    profit: -0.0288,
    barsHeld: 0
  },
  {
    id: "405122aa-e129-4a5b-bf33-9e82c6d25e44",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-02-01T23:20:38.205",
    profit: 0.0152,
    barsHeld: 2
  },
  {
    id: "7df0ac64-81d8-4a8f-a262-6b185dee0f4c",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-02-01T23:35:06.309",
    profit: -0.043644,
    barsHeld: 1
  },
  {
    id: "7d14e971-43e5-4f1a-9e11-31df4ce46a10",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-02-02T00:10:57.082",
    profit: 0.007026,
    barsHeld: 2
  },
  {
    id: "41e19833-5d86-4dba-a731-a946b0e5d91c",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-02-02T00:41:39.554",
    profit: 0.0336,
    barsHeld: 5
  },
  {
    id: "048de794-2ed4-4137-8c24-018f5d44c818",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-02-02T00:55:05.691",
    profit: -0.022371,
    barsHeld: 0
  },
  {
    id: "1a62eaa0-1daa-4d34-b8eb-029ae317a2ab",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-02-02T01:05:12.947",
    profit: -0.0108,
    barsHeld: 0
  },
  {
    id: "ce14b414-038e-4923-832b-098728343da5",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-02-02T01:25:42.421",
    profit: 0.0252,
    barsHeld: 3
  },
  {
    id: "d7a17694-0d02-4d44-b8e1-e9ae57c32869",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-02-02T01:45:08.62",
    profit: -0.0088,
    barsHeld: 1
  },
  {
    id: "7e31299b-1ad1-4cc1-8f70-f5c06501a7b9",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-02-02T01:56:57.419",
    profit: -0.0054,
    barsHeld: 2
  },
  {
    id: "4e763e26-79f4-4183-8f6b-c237876770dc",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-02-02T02:20:04.875",
    profit: 0.060371,
    barsHeld: 1
  },
  {
    id: "f42de441-92f4-4a18-bb6a-e2284e697f78",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-02-02T02:41:19.651",
    profit: -0.031961,
    barsHeld: 2
  },
  {
    id: "96a3593f-55b6-4dc3-9beb-8be89acfc5ba",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-02-02T03:50:08.441",
    profit: 0.0178,
    barsHeld: 3
  },
  {
    id: "0f664d96-28e2-4ae2-a1dc-636fa1c39422",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-02-02T04:00:52.473",
    profit: -0.0002,
    barsHeld: 2
  },
  {
    id: "9f826df3-7b9a-487d-8b76-b49c05329255",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-02-02T06:21:28.298",
    profit: 0.002641,
    barsHeld: 4
  },
  {
    id: "a1523550-bb82-4156-ba25-e33ab3de8135",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-02-02T06:40:07.01",
    profit: 0.048979,
    barsHeld: 2
  },
  {
    id: "296ff81a-b5e4-4d12-8413-bee50579318d",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-02-02T06:50:04.657",
    profit: -0.0232,
    barsHeld: 0
  },
  {
    id: "801f9277-e152-46e9-abe2-780b7e326d8e",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-02-02T07:11:58.72",
    profit: -0.0218,
    barsHeld: 4
  },
  {
    id: "24d293d2-7d36-441f-84a7-6ec2230193e9",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-02-02T07:40:02.648",
    profit: -0.018798,
    barsHeld: 0
  },
  {
    id: "a8472186-6c8a-4200-929e-d01062e94ba1",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-02-02T07:52:35.101",
    profit: -0.01,
    barsHeld: 1
  },
  {
    id: "dac10a3a-53c2-4247-8a6b-d2dbe9c9d97b",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-02-02T08:05:02.386",
    profit: -0.006261,
    barsHeld: 1
  },
  {
    id: "e29cc251-bd8a-43e3-b88b-6f8badbdad63",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-02-02T08:25:22.015",
    profit: -0.0176,
    barsHeld: 0
  },
  {
    id: "08709566-d866-4a97-a8ca-4c4f90a78b1c",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-02-02T08:53:20.356",
    profit: -0.0188,
    barsHeld: 1
  },
  {
    id: "1b592dd6-7142-45aa-b4e1-ca044e0fa965",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-02-02T09:40:22.524",
    profit: -0.0128,
    barsHeld: 3
  },
  {
    id: "979b921a-1e3d-4012-96d9-f5145107797f",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-02-02T09:55:06.765",
    profit: -0.0242,
    barsHeld: 0
  },
  {
    id: "35a40629-9d2b-49f3-b8e0-2a83bb14fdd3",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-02-02T10:21:45.168",
    profit: 0.0564,
    barsHeld: 4
  },
  {
    id: "02e09341-b3ff-4e9e-85b8-63d0eaf7235a",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-02-02T10:40:09.972",
    profit: -0.029,
    barsHeld: 0
  },
  {
    id: "6266a7e2-e62a-48da-96fa-163a8a03b125",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-02-02T11:21:49.535",
    profit: -0.014,
    barsHeld: 1
  },
  {
    id: "9cb969b8-3ecf-49e7-9c12-6f3337b17bd5",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-02-02T11:55:50.708",
    profit: 0.002,
    barsHeld: 3
  },
  {
    id: "044913b1-708b-4b02-b703-9e49a4f62792",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-02-02T12:10:24.019",
    profit: 0.0318,
    barsHeld: 3
  },
  {
    id: "faec19a8-0261-461b-9ad3-e98377767e3f",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-02-02T12:25:21.154",
    profit: 0.0378,
    barsHeld: 2
  },
  {
    id: "3b3a5c18-c695-476b-85d0-34bb5746fa0b",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-02-02T13:45:31.281",
    profit: 0.0036,
    barsHeld: 2
  },
  {
    id: "014c8b5b-7838-44d6-a6ef-02cc38a0a255",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-02-02T14:10:04.848",
    profit: -0.0098,
    barsHeld: 0
  },
  {
    id: "e6ff0d4f-9b78-42bb-a8e4-b69f80324751",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-02-02T14:20:10.111",
    profit: -0.028,
    barsHeld: 1
  },
  {
    id: "fa233a77-59e3-4fe0-a9be-43ae35cd90f2",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-02-02T14:44:39.202",
    profit: 0.028,
    barsHeld: 2
  },
  {
    id: "9b051a20-26d9-4e20-ac16-0244bcc51204",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-02-02T15:00:03.844",
    profit: -0.008275,
    barsHeld: 1
  },
  {
    id: "ae6b82b9-d571-4792-9db6-478c1c7d38c5",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-02-02T16:00:04.374",
    profit: -0.0002,
    barsHeld: 1
  },
  {
    id: "d1ed8953-8343-4fd0-9fd2-341e0553525a",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-02-02T16:30:02.048",
    profit: 0.006,
    barsHeld: 3
  },
  {
    id: "64717ee4-a96a-4117-8f25-f2a398d6ec97",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-02-02T16:40:07.217",
    profit: -0.0216,
    barsHeld: 2
  },
  {
    id: "eb0a9d30-3f28-46c2-bcf0-ad8a3c025fb6",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-02-02T17:02:58.919",
    profit: -0.002909,
    barsHeld: 2
  },
  {
    id: "430a9089-11a3-498a-8847-5ee3a7545999",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-02-02T17:29:13.576",
    profit: 0.0218,
    barsHeld: 4
  },
  {
    id: "187bd20e-db34-43d7-8fe1-065494293e14",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-02-02T17:50:05.007",
    profit: -0.0038,
    barsHeld: 2
  },
  {
    id: "6d8d30a0-75ae-4635-a30f-7c8143d9310f",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-02-02T18:47:49.449",
    profit: -0.0033,
    barsHeld: 2
  },
  {
    id: "afd848b6-c390-4650-ad50-2567bc085c66",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-02-02T19:12:25.097",
    profit: 0.012,
    barsHeld: 2
  },
  {
    id: "3aee7a96-1056-4276-a0d6-f7b0aea36f43",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-02-02T19:51:57.07",
    profit: 0.0038,
    barsHeld: 3
  },
  {
    id: "22638618-84a5-4e48-8be5-5dc3f49ca124",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-02-02T20:05:08.195",
    profit: -0.009,
    barsHeld: 2
  },
  {
    id: "810171f9-8dd3-45f4-a11c-fe0bd31bdf4d",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-02-02T20:50:09.796",
    profit: 0.0056,
    barsHeld: 1
  },
  {
    id: "23b5f722-eb27-4c44-b627-5fc777722259",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-02-02T22:01:45.533",
    profit: 0.009943,
    barsHeld: 3
  },
  {
    id: "17d967e5-372e-4ca0-9795-c98d0f8eb3c4",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-02-02T22:10:04.084",
    profit: -0.0002,
    barsHeld: 1
  },
  {
    id: "8a15f5b7-5438-47d0-b1aa-d76378cd7a51",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-02-02T22:48:18.143",
    profit: 0.0806,
    barsHeld: 4
  },
  {
    id: "1cf77cdf-f041-472c-8cf3-59dd7e51f01a",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-02-02T23:08:53.375",
    profit: -0.019,
    barsHeld: 1
  },
  {
    id: "d330ae93-6a1a-4c9a-bd04-b2366ec3b23d",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-02-02T23:25:04.714",
    profit: -0.0084,
    barsHeld: 1
  },
  {
    id: "b2305bf5-8078-4838-90aa-4b350b160559",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-02-02T23:40:06.287",
    profit: -0.036551,
    barsHeld: 2
  },
  {
    id: "dbec345a-7591-4876-aacf-e53d80a50ee1",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-02-03T00:00:10.586",
    profit: -0.0112,
    barsHeld: 1
  },
  {
    id: "67fc3886-56fb-4811-b0a9-eeb1a457f601",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-02-03T00:10:33.95",
    profit: -0.0238,
    barsHeld: 1
  },
  {
    id: "cc67d3ff-bcdc-4885-a948-21b863efda96",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-02-03T00:23:34.492",
    profit: -0.018,
    barsHeld: 1
  },
  {
    id: "8892e5fc-15d4-445b-b9c2-caaa612e16a3",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-02-03T00:50:16.843",
    profit: 0.0328,
    barsHeld: 2
  },
  {
    id: "dcf318dd-3621-4ad0-b8f4-2ea9dc91061b",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-02-03T01:08:05.585",
    profit: 0.0126,
    barsHeld: 2
  },
  {
    id: "bf59c5b9-7d0d-47d4-9388-5be78a5bc6ad",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-02-03T01:40:02.999",
    profit: 0.2234,
    barsHeld: 2
  },
  {
    id: "7e4e47ca-e990-4298-9743-dd5dfb4dee93",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-02-03T02:10:02.674",
    profit: 0,
    barsHeld: 1
  },
  {
    id: "44c748f5-88c3-42c9-b7fe-dc86591152c1",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-02-03T03:05:04.528",
    profit: 0.0202,
    barsHeld: 2
  },
  {
    id: "e50b8cf1-b89c-4704-b727-c60932347a32",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-02-03T03:38:55.3",
    profit: -0.006324,
    barsHeld: 1
  },
  {
    id: "37ac7af7-f991-408c-832c-d8c2524e0096",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-02-03T04:10:19.966",
    profit: -0.000688,
    barsHeld: 1
  },
  {
    id: "872828f9-fd6a-41d3-9c69-333857675437",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-02-03T04:35:05.199",
    profit: -0.0104,
    barsHeld: 1
  },
  {
    id: "b6f1f2af-66f5-4ea2-b9fa-95fc64913bf2",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-02-03T05:22:54.26",
    profit: 0.0338,
    barsHeld: 3
  },
  {
    id: "c9c52c9d-5e26-44cf-bf74-d1bbdb8be3e3",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-02-03T05:38:38.319",
    profit: 0.0014,
    barsHeld: 2
  },
  {
    id: "00381681-80f2-4a68-b05a-243ac0ed6ca8",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-02-03T06:20:05.526",
    profit: 0.007,
    barsHeld: 3
  },
  {
    id: "bd11ea3d-a5bc-4285-80e7-f3b090ef9123",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-02-03T06:55:03.191",
    profit: 0.0096,
    barsHeld: 2
  },
  {
    id: "3508420e-86bf-46db-a03f-c27e14f6001e",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-02-03T07:15:04.924",
    profit: 0.0244,
    barsHeld: 1
  },
  {
    id: "36b48f81-e5cf-49ce-bd69-5f32c527cf6d",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-02-03T07:35:03.323",
    profit: 0.0142,
    barsHeld: 3
  },
  {
    id: "69a4dd8a-8b7b-4272-a4fe-0dd1d7012a90",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-02-03T08:10:05.752",
    profit: -0.016,
    barsHeld: 0
  },
  {
    id: "e867f11d-2332-40ee-9987-4e788cf09180",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-02-03T08:20:19.681",
    profit: -0.021815,
    barsHeld: 0
  },
  {
    id: "f715dffa-c4fe-400f-b879-243e85946104",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-02-03T08:35:05.901",
    profit: 0.004786,
    barsHeld: 2
  },
  {
    id: "3927a740-37cc-4eb3-919c-2cd39b3c1052",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-02-03T08:45:48.175",
    profit: -0.0002,
    barsHeld: 2
  },
  {
    id: "568d89df-da6a-403f-abb7-4300dd5fdc27",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-02-03T08:58:31.018",
    profit: -0.0366,
    barsHeld: 1
  },
  {
    id: "45132f8c-02ca-40e1-a07b-e8af514943d5",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-02-03T09:11:07.028",
    profit: 0.0014,
    barsHeld: 2
  },
  {
    id: "5ebd1e01-da16-45d3-9dbf-ac3b752b3036",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-02-03T09:23:10.836",
    profit: -0.004,
    barsHeld: 1
  },
  {
    id: "1e112735-fda9-4a37-aa33-ca5135eaeab2",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-02-03T10:05:08.96",
    profit: 0.02,
    barsHeld: 2
  },
  {
    id: "849ff443-fbb9-48c0-866a-faffa934c9ee",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-02-03T10:16:04.57",
    profit: -0.0252,
    barsHeld: 1
  },
  {
    id: "69e29f48-aa91-4530-9375-30e7eb640fc9",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-02-03T10:30:26.181",
    profit: -0.003049,
    barsHeld: 2
  },
  {
    id: "564772be-5893-4741-95da-6ce8f1b2c974",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-02-03T10:55:02.931",
    profit: 0.0072,
    barsHeld: 1
  },
  {
    id: "862cd710-4b0c-4d91-8af3-90710e452c80",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-02-03T11:05:13.325",
    profit: -0.034,
    barsHeld: 1
  },
  {
    id: "08967194-3039-4f89-897a-409a7fe3a1d3",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-02-03T11:22:12.265",
    profit: -0.007851,
    barsHeld: 2
  },
  {
    id: "9a8cab2d-8076-48bf-b854-b78e6d0a48d2",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-02-03T11:40:18.626",
    profit: 0.0139,
    barsHeld: 2
  },
  {
    id: "b034463c-f06c-4bb2-809e-3ebc58d92504",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-02-03T11:50:06.344",
    profit: -0.0674,
    barsHeld: 2
  },
  {
    id: "72325cc9-e491-44c6-9ac6-38de5a9935d2",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-02-03T12:06:48.502",
    profit: -0.023263,
    barsHeld: 1
  },
  {
    id: "bbd4cc27-eb76-4fe5-97fc-5a11f1300abd",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-02-03T12:46:49.548",
    profit: 0,
    barsHeld: 2
  },
  {
    id: "ba82b9fb-d3c1-4971-ab3f-365f1dfad204",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-02-03T13:10:02.123",
    profit: -0.003,
    barsHeld: 2
  },
  {
    id: "288d65a7-fd7f-4a2e-82d0-de15ae5b3e82",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-02-03T13:26:39.366",
    profit: 0.0134,
    barsHeld: 2
  },
  {
    id: "e94fda47-82dc-4c47-af3f-699467c1b9c6",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-02-03T13:40:09.436",
    profit: 0.027,
    barsHeld: 3
  },
  {
    id: "12f660d3-a0ac-4786-bdd8-a3143f4b0ed3",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-02-03T13:53:24.096",
    profit: -0.0132,
    barsHeld: 2
  },
  {
    id: "4827d900-cb73-40c0-bb4d-a1061f195978",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-02-03T14:19:30.068",
    profit: -0.005,
    barsHeld: 1
  },
  {
    id: "5bc63860-dd4d-411b-ab52-45a8c1fb8d8e",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-02-03T14:30:04.722",
    profit: -0.014511,
    barsHeld: 0
  },
  {
    id: "f7e79c67-aec7-40bf-b402-d2db296257f3",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-02-03T14:40:02.826",
    profit: -0.0068,
    barsHeld: 0
  },
  {
    id: "02d19e2c-ce25-42f7-9521-6b7207961b12",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-02-03T15:00:07.267",
    profit: 0.0094,
    barsHeld: 3
  },
  {
    id: "cebf103b-b5b4-4c0e-8126-48d2a2decc4c",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-02-03T15:35:02.762",
    profit: 0.0424,
    barsHeld: 3
  },
  {
    id: "ae9c6881-da72-483b-b874-a26afeabc5f3",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-02-03T16:05:02.263",
    profit: -0.022,
    barsHeld: 2
  },
  {
    id: "2acc6035-93a6-4de0-86ca-2eb40c4eac64",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-02-03T16:23:14.34",
    profit: -0.0112,
    barsHeld: 1
  },
  {
    id: "ff8f53ab-ad51-4547-a0af-4f17964a2cc9",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-02-03T16:55:20.918",
    profit: -0.0314,
    barsHeld: 1
  },
  {
    id: "2a719cb5-3a93-4588-8a4a-75e4b27812fb",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-02-03T17:06:24.459",
    profit: -0.000698,
    barsHeld: 1
  },
  {
    id: "2314cfab-0a52-47f5-a3a9-25bfbe5da0f9",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-02-03T17:59:37.418",
    profit: 0.003192,
    barsHeld: 5
  },
  {
    id: "8e9a4ee2-7eeb-48c3-8f26-92ef81a51a7f",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-02-03T18:20:09.696",
    profit: 0.0012,
    barsHeld: 1
  },
  {
    id: "42dd3fca-b11c-40ad-ab1f-7771aa043671",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-02-03T18:45:10.965",
    profit: -0.0202,
    barsHeld: 0
  },
  {
    id: "73682693-73d5-4f17-9959-6bb9c59e3399",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-02-03T19:05:42.254",
    profit: -0.0012,
    barsHeld: 1
  },
  {
    id: "4de464dc-78a5-44d0-8e9b-87b00c421487",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-02-03T19:35:22.587",
    profit: -0.0002,
    barsHeld: 1
  },
  {
    id: "502c1f8e-1607-44e7-8229-dd3a1f2c0e6f",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-02-03T19:45:06.401",
    profit: -0.0002,
    barsHeld: 1
  },
  {
    id: "df67629d-c1f7-41c0-ad7b-f3d21fe567f6",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-02-03T19:57:35.247",
    profit: -0.0002,
    barsHeld: 1
  },
  {
    id: "7417c601-9794-4844-98ea-bec19d6e4987",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-02-03T20:05:05.317",
    profit: -0.0002,
    barsHeld: 1
  },
  {
    id: "cc39700e-ce48-4904-885d-76ef5697bafb",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-02-03T20:15:12.663",
    profit: -0.0268,
    barsHeld: 0
  },
  {
    id: "bd8194cb-6feb-4c8f-8db8-5c4b51996567",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-02-03T20:30:08.498",
    profit: -0.002,
    barsHeld: 2
  },
  {
    id: "ef7695b1-a4c6-4a59-a3aa-a6befdfea6b3",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-02-03T21:05:16.934",
    profit: -0.00168,
    barsHeld: 0
  },
  {
    id: "c4403117-3f03-46c8-8482-72cea7a6de1b",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-02-03T21:15:15.794",
    profit: -0.0002,
    barsHeld: 1
  },
  {
    id: "ef151cd1-fddb-4a96-a6c8-2c047860cbb7",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-02-03T21:50:19.734",
    profit: -0.0162,
    barsHeld: 0
  },
  {
    id: "5e1b4ddb-9659-4b1b-af29-a810acd31378",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-02-03T22:00:03.305",
    profit: -0.0276,
    barsHeld: 2
  },
  {
    id: "d9ea0c14-7c11-417b-8f0b-7ae4647b1f3b",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-02-03T22:50:02.161",
    profit: -0.0094,
    barsHeld: 2
  },
  {
    id: "4c800dc6-6543-4946-81be-2557582188dc",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-02-03T23:10:06.843",
    profit: -0.0114,
    barsHeld: 0
  },
  {
    id: "ef695e81-7a9a-4052-a3d3-65a1325930ff",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-02-03T23:22:30.444",
    profit: -0.0242,
    barsHeld: 1
  },
  {
    id: "467228ac-6583-4d4b-a491-68689a9d7a78",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-02-03T23:36:07.47",
    profit: 0.0126,
    barsHeld: 2
  },
  {
    id: "234f44f0-b954-47c4-936d-66362930910a",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-02-03T23:55:41.486",
    profit: 0.0074,
    barsHeld: 3
  },
  {
    id: "4fd4dc93-2eb5-4dd7-84d1-f7a6a5396255",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-02-04T00:15:26.964",
    profit: 0.0206,
    barsHeld: 1
  },
  {
    id: "fd45a320-d81e-4393-b250-13169a2787d2",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-02-04T00:33:14.65",
    profit: 0.0226,
    barsHeld: 2
  },
  {
    id: "2fafad34-3d69-48be-913e-022648c1d112",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-02-04T00:40:49.371",
    profit: -0.014,
    barsHeld: 1
  },
  {
    id: "2d9c4820-9d29-4842-b18c-bb5d66f1620a",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-02-04T01:30:11.897",
    profit: 0.006071,
    barsHeld: 2
  },
  {
    id: "6eec9e4a-3120-4755-8e8a-4b4be9e40696",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-02-04T02:00:35.397",
    profit: -0.0138,
    barsHeld: 1
  },
  {
    id: "f8b558f2-5eef-4cc6-87b8-e003cd50bb44",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-02-04T02:36:51.937",
    profit: -0.011,
    barsHeld: 2
  },
  {
    id: "4b4c8f02-5367-4561-b267-f2df5e288192",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-02-04T03:00:25.099",
    profit: 0,
    barsHeld: 2
  },
  {
    id: "6069c9ba-0521-4e47-b086-2d76304c0f5d",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-02-04T03:15:08.746",
    profit: -0.0034,
    barsHeld: 1
  },
  {
    id: "c48ce4f5-5dc3-4599-856c-ac4e737cb44b",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-02-04T03:29:03.664",
    profit: -0.078,
    barsHeld: 2
  },
  {
    id: "94272509-d836-40b0-a287-6ba3be199e25",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-02-04T03:45:05.97",
    profit: 0.0002,
    barsHeld: 1
  },
  {
    id: "ac65a223-57f8-47f2-aa86-6b3100f039a3",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-02-04T04:24:12.706",
    profit: 0.013614,
    barsHeld: 2
  },
  {
    id: "5bd22284-3008-4795-8965-4d354eb1eda4",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-02-04T04:45:11.77",
    profit: -0.003686,
    barsHeld: 0
  },
  {
    id: "1aa1e1e2-db52-4190-901c-6ab29b851844",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-02-04T04:55:13.559",
    profit: -0.0148,
    barsHeld: 1
  },
  {
    id: "119590e3-e990-4893-a76d-9f215ae6c4a7",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-02-04T05:05:02.006",
    profit: -0.0238,
    barsHeld: 0
  },
  {
    id: "89b5846a-94a9-41ee-ab81-1da3c5e4b695",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-02-04T05:49:42.644",
    profit: -0.0214,
    barsHeld: 1
  },
  {
    id: "48560dd3-ec95-4009-83e0-e2c613c1401b",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-02-04T06:00:38.893",
    profit: -0.0108,
    barsHeld: 1
  },
  {
    id: "253b5521-62e9-4ea1-b861-2139f051e0f3",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-02-04T06:20:18.159",
    profit: -0.0112,
    barsHeld: 2
  },
  {
    id: "16ba1cd4-8307-4d1b-8e51-af755039d231",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-02-04T06:45:02.862",
    profit: -0.0146,
    barsHeld: 1
  },
  {
    id: "6f87d6a7-52ce-46c9-81b5-6b1ff82a5ac9",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-02-04T07:21:06.755",
    profit: -0.0202,
    barsHeld: 1
  },
  {
    id: "834b8fad-cf61-47c7-a35f-331590af95d1",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-02-04T07:35:53.257",
    profit: 0.026246,
    barsHeld: 3
  },
  {
    id: "4a785c2f-32fa-485b-a972-9c41d62d869b",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-02-04T08:45:07.759",
    profit: 0.0288,
    barsHeld: 3
  },
  {
    id: "d47ab53c-423f-4c95-8089-779d5a0d309f",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-02-04T09:02:26.483",
    profit: 0.005906,
    barsHeld: 2
  },
  {
    id: "2f1f8ae7-eb44-4eed-98a2-ba23d852e181",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-02-04T09:43:34.269",
    profit: 0.057513,
    barsHeld: 7
  },
  {
    id: "03094491-7766-4986-a2fc-36e66ae70aee",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-02-04T10:09:57.591",
    profit: 0.0158,
    barsHeld: 4
  },
  {
    id: "a434e66d-d124-44f0-a67e-069b66046b7b",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-02-04T16:35:04.908",
    profit: -0.0106,
    barsHeld: 1
  },
  {
    id: "b384c0aa-abe7-4e43-8a97-6fbe0b18b793",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-02-04T16:55:42.766",
    profit: -0.0008,
    barsHeld: 0
  },
  {
    id: "f3f7a190-ddf9-4e7f-ae38-8cfcc1495ad9",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-02-04T17:27:47.949",
    profit: 0.0058,
    barsHeld: 2
  },
  {
    id: "088e1cd3-5078-48ec-bb37-c46fe88d8126",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-02-04T18:14:55.237",
    profit: 0.0292,
    barsHeld: 3
  },
  {
    id: "b63ea9a5-56d3-4f6e-9b63-b12fa56cf31e",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-02-04T18:50:10.919",
    profit: -0.004886,
    barsHeld: 0
  },
  {
    id: "ca128896-ac3a-43ab-a54b-c7cb95c0faee",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-02-04T19:23:56.149",
    profit: 0.001165,
    barsHeld: 2
  },
  {
    id: "cc613f7f-0bca-4783-96b5-f2fc0f75be78",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-02-04T19:41:26.092",
    profit: -0.0042,
    barsHeld: 4
  },
  {
    id: "b5f49f4f-61b7-422a-a166-f7c872c3accc",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-02-04T20:10:08.683",
    profit: -0.0028,
    barsHeld: 0
  },
  {
    id: "993d8bcf-58cc-4701-8c8a-bb37ec619e7f",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-02-04T20:42:31.08",
    profit: -0.0146,
    barsHeld: 1
  },
  {
    id: "02de141d-a9ab-497d-8389-4223c6c2f4f6",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-02-04T21:05:10.899",
    profit: 0.0138,
    barsHeld: 2
  },
  {
    id: "da56aa32-e5f4-4ee1-a7ba-26ff5a8b85e1",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-02-04T21:38:39.163",
    profit: -0.0194,
    barsHeld: 1
  },
  {
    id: "89469b2d-fed9-4a2c-9977-0ace590484ad",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-02-04T21:45:02.79",
    profit: -0.024442,
    barsHeld: 0
  },
  {
    id: "c8908197-f437-4c8a-86a8-6679529b62d3",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-02-04T22:01:01.425",
    profit: 0.005074,
    barsHeld: 2
  },
  {
    id: "2786cc4d-655b-43c0-b2d0-65bafa52e5ff",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-02-04T22:15:49.269",
    profit: 0.008,
    barsHeld: 2
  },
  {
    id: "88348c7a-f8b0-455b-aedd-c7b87a4b3afb",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-02-04T23:00:07.729",
    profit: 0.0182,
    barsHeld: 3
  },
  {
    id: "aa1e70bb-b4d8-4c8e-ba0f-e604e736829a",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-02-04T23:31:08.862",
    profit: -0.007041,
    barsHeld: 1
  },
  {
    id: "8645a864-9c46-4d67-9cb5-554261cf7c58",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-02-05T00:22:16.511",
    profit: -0.002,
    barsHeld: 2
  },
  {
    id: "ceaff2dd-de4c-4513-b709-c4161642db79",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-02-05T00:58:34.339",
    profit: 0.0228,
    barsHeld: 5
  },
  {
    id: "d431b612-2782-4793-97aa-90c034f6e854",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-02-05T01:10:32.077",
    profit: -0.0164,
    barsHeld: 2
  },
  {
    id: "742d1a94-743f-421b-9c24-f9d1ea00fd8d",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-02-05T01:44:15.329",
    profit: -0.0084,
    barsHeld: 2
  },
  {
    id: "c1420cc2-e6fb-4992-8dda-13d1da909e5f",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-02-05T02:10:16.998",
    profit: 0.0064,
    barsHeld: 2
  },
  {
    id: "b8e87d5f-6697-484b-911a-66c8f6c32412",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-02-05T02:20:23.906",
    profit: -0.0016,
    barsHeld: 0
  },
  {
    id: "d290a9a1-5b48-4760-b55f-607c21331e20",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-02-05T03:00:02.655",
    profit: 0.032044,
    barsHeld: 2
  },
  {
    id: "25a04c21-d200-4514-9327-b4bac7bb79be",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-02-05T03:15:15.775",
    profit: -0.0326,
    barsHeld: 2
  },
  {
    id: "62ec7836-21cc-4749-84ff-0bba30664b2e",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-02-05T04:08:07.879",
    profit: 0.029948,
    barsHeld: 3
  },
  {
    id: "9b58ca40-8d3d-4a26-84bd-ee4bff3778ca",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-02-05T04:15:06.738",
    profit: -0.001002,
    barsHeld: 0
  },
  {
    id: "f185a83e-7557-4f94-8d2e-3d3cd0809257",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-02-05T04:55:03.36",
    profit: -0.0084,
    barsHeld: 3
  },
  {
    id: "f04e5528-3fb5-4755-ace8-1c08701d7bd4",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-02-05T05:05:03.672",
    profit: -0.000046,
    barsHeld: 1
  },
  {
    id: "96b8e71c-1798-4a96-94e9-c24d85e69f7c",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-02-05T05:50:04.794",
    profit: 0.0212,
    barsHeld: 1
  },
  {
    id: "8c70b491-d3f8-485f-83c4-ae7e2680d238",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-02-05T08:30:12.805",
    profit: -0.0078,
    barsHeld: 0
  },
  {
    id: "a01f26a3-0803-448f-aab9-7ab48f82a6e7",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-02-05T08:40:33.089",
    profit: -0.0012,
    barsHeld: 1
  },
  {
    id: "c218a56d-f239-45e1-862c-4b4c71de322e",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-02-05T09:10:02.371",
    profit: -0.009,
    barsHeld: 3
  },
  {
    id: "d3e88d76-e4b0-4093-abf5-683633c563f9",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-02-05T09:50:04.272",
    profit: 0.0058,
    barsHeld: 2
  },
  {
    id: "52536c8d-bab6-4b38-92a0-477cd9713ec2",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-02-05T10:35:11.839",
    profit: 0.0942,
    barsHeld: 2
  },
  {
    id: "3270fd3f-e774-41e8-af3a-f29b685443d3",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-02-05T10:55:05.176",
    profit: -0.0256,
    barsHeld: 2
  },
  {
    id: "891f4bb7-c013-4066-89e3-13d98b2943e0",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-02-05T20:01:01.4",
    profit: -0.0252,
    barsHeld: 1
  },
  {
    id: "ab3d4a8a-f133-4a87-90d9-bdd6d5791b4a",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-02-05T21:15:11.88",
    profit: -0.010793,
    barsHeld: 0
  },
  {
    id: "cd889884-fe6b-4903-95ca-08efbbc2bc88",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-02-05T21:39:12.244",
    profit: -0.0106,
    barsHeld: 4
  },
  {
    id: "a7688643-0b79-47a1-9bc4-67091c6b4f99",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-02-05T21:50:29.563",
    profit: -0.033,
    barsHeld: 1
  },
  {
    id: "284423b9-3a41-4c0a-a177-83896982f59f",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-02-05T22:20:02.299",
    profit: 0.0764,
    barsHeld: 3
  },
  {
    id: "e8326818-ee83-4ea2-9151-a67dab6c957d",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-02-05T22:55:02.214",
    profit: -0.0196,
    barsHeld: 2
  },
  {
    id: "5faeda38-bfc9-42b2-9026-4ba2d92192a9",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-02-06T00:13:46.286",
    profit: -0.025465,
    barsHeld: 11
  },
  {
    id: "8784a956-35c1-4c13-914c-8d1295f92c20",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-02-06T00:25:03.866",
    profit: 0.032,
    barsHeld: 1
  },
  {
    id: "c79adf51-6fad-4d0f-91cc-3dece27a2bde",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-02-06T00:42:44.07",
    profit: -0.0664,
    barsHeld: 3
  },
  {
    id: "83880bda-2e9f-483e-a094-dfe25457b399",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-02-06T01:30:49.928",
    profit: 0.03,
    barsHeld: 2
  },
  {
    id: "a62dc76e-0bef-430c-8097-678e283f3640",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-02-06T02:03:08.141",
    profit: 0.0226,
    barsHeld: 4
  },
  {
    id: "0d2351d4-3dfa-45b7-b303-5d15eb047687",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-02-06T02:35:40.336",
    profit: 0.045,
    barsHeld: 2
  },
  {
    id: "fcee2417-eaed-4bd0-91ca-24aa399461d7",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-02-06T03:21:53.593",
    profit: -0.0002,
    barsHeld: 1
  },
  {
    id: "74785cd5-e5ea-4950-af6c-8894ad82875f",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-02-06T03:40:12.86",
    profit: -0.023596,
    barsHeld: 0
  },
  {
    id: "75e176c3-344a-4b48-b1a9-18b2bee5450a",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-02-06T04:07:24.481",
    profit: 0.0404,
    barsHeld: 2
  },
  {
    id: "e037c1b1-e147-47fe-a636-94566de5098e",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-02-06T04:15:10.614",
    profit: -0.0304,
    barsHeld: 2
  },
  {
    id: "8408254d-58c9-4e29-8a62-e56c2f696d1b",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-02-06T04:40:42.517",
    profit: -0.0152,
    barsHeld: 1
  },
  {
    id: "194f284e-8994-4260-988b-0b266034c987",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-02-06T05:15:24.222",
    profit: -0.0034,
    barsHeld: 2
  },
  {
    id: "3c46a9dc-5b09-4fb7-a98e-1b441e089248",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-02-06T05:55:06.703",
    profit: -0.0064,
    barsHeld: 2
  },
  {
    id: "16315405-6c25-4309-a977-81ad4f6bb3f8",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-02-06T06:15:06.928",
    profit: 0.0184,
    barsHeld: 2
  },
  {
    id: "77d874d2-75c5-4875-b176-b69741f0c321",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-02-06T06:59:52.052",
    profit: 0.034,
    barsHeld: 3
  },
  {
    id: "d41ae144-0cbf-4dba-81b9-b61c9da8b55c",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-02-06T07:35:03.592",
    profit: -0.0114,
    barsHeld: 2
  },
  {
    id: "249ef9b1-08be-4d24-adc0-f289f8278c86",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-02-06T08:00:27.766",
    profit: -0.1492,
    barsHeld: 1
  },
  {
    id: "f2dcf97a-dac6-48d3-8f58-a4728e1fe7fe",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-02-06T09:10:14.788",
    profit: 0.0022,
    barsHeld: 1
  },
  {
    id: "1d140a6a-99ac-4dd1-900c-d6c9df1343fc",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-02-06T09:29:28.449",
    profit: -0.0174,
    barsHeld: 1
  },
  {
    id: "905bb1d3-adf6-4348-b5c2-72d960416a1c",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-02-06T10:05:12.474",
    profit: -0.0028,
    barsHeld: 2
  },
  {
    id: "73ac0394-a6df-483a-abbd-ca4b20e31cde",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-02-06T10:15:03.735",
    profit: 0,
    barsHeld: 0
  },
  {
    id: "fd4f1c88-191e-4027-9aec-4c2ddc7b0a7c",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-02-06T10:50:55.403",
    profit: 0.0104,
    barsHeld: 2
  },
  {
    id: "bcb6fef6-e5aa-46c6-bf53-bdee3f57edfe",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-02-06T11:10:41.296",
    profit: 0.0018,
    barsHeld: 2
  },
  {
    id: "263d0bf3-6c44-40d6-88a2-a483628f9200",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-02-06T12:00:23.574",
    profit: 0.0414,
    barsHeld: 4
  },
  {
    id: "c050dcb0-90b0-4c1c-8ace-7796a05b3ef2",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-02-06T12:32:00.835",
    profit: 0.026219,
    barsHeld: 6
  },
  {
    id: "18a70c27-46a2-42b9-87dd-ac1320bf9e73",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-02-06T13:15:03.987",
    profit: 0.1638,
    barsHeld: 6
  }
];

describe("Test 'tradeStatistics' utils", () => {
  describe("Test 'calcStatistics'", () => {
    it("Should calc stats", () => {
      const result = calcStatistics(positions);
      console.log(result.statistics.performance.slice(-1));
      console.log(result.equity.changes);
      expect(result).toBeTruthy();
    });
  });
});
