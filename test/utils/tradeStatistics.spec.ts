import { calcStatistics } from "../../utils/tradeStatistics";
import { cpz } from "../../@types";

const positions: cpz.PositionDataForStats[] = [
  {
    id: "7774a322-88dd-4a55-a197-73dbf5b6b102",
    direction: cpz.PositionDirection.short,
    exitDate: "2019-12-25T01:30:00",
    profit: 0.03036,
    barsHeld: 14
  },
  {
    id: "c6103bdf-9775-4a71-85e9-0b2f71fd0ccd",
    direction: cpz.PositionDirection.long,
    exitDate: "2019-12-25T02:35:00",
    profit: 0.02916,
    barsHeld: 13
  },
  {
    id: "c7f5a480-3980-4668-ae38-bbcb01ca7c4f",
    direction: cpz.PositionDirection.short,
    exitDate: "2019-12-25T03:25:00",
    profit: 0.034494,
    barsHeld: 10
  },
  {
    id: "85cc4d61-679c-4139-a0f9-fe690c846d6c",
    direction: cpz.PositionDirection.long,
    exitDate: "2019-12-25T04:00:00",
    profit: 0.006849,
    barsHeld: 7
  },
  {
    id: "f2edcf20-ea7b-47f7-b7d1-914dd2d05cba",
    direction: cpz.PositionDirection.short,
    exitDate: "2019-12-25T04:35:00",
    profit: -0.003285,
    barsHeld: 7
  },
  {
    id: "9cacd0fd-9983-46d6-8673-48acda99a9e7",
    direction: cpz.PositionDirection.long,
    exitDate: "2019-12-25T05:00:00",
    profit: 0.03056,
    barsHeld: 5
  },
  {
    id: "3f8e7794-4bb0-44f9-86a5-4b26874b27ed",
    direction: cpz.PositionDirection.short,
    exitDate: "2019-12-25T05:15:00",
    profit: 0.00256,
    barsHeld: 3
  },
  {
    id: "b6306220-89a0-4e29-9cce-3858826b4f69",
    direction: cpz.PositionDirection.long,
    exitDate: "2019-12-25T05:30:00",
    profit: -0.00124,
    barsHeld: 3
  },
  {
    id: "caf7c25e-8a13-4845-83be-45f1e71efaa7",
    direction: cpz.PositionDirection.short,
    exitDate: "2019-12-25T07:05:00",
    profit: 0.034627,
    barsHeld: 19
  },
  {
    id: "e94e15f1-778d-461d-a7f6-e4b261e05bd3",
    direction: cpz.PositionDirection.long,
    exitDate: "2019-12-25T07:10:00",
    profit: -0.009973,
    barsHeld: 1
  },
  {
    id: "a25ce439-631f-4123-bad0-acd2b4611746",
    direction: cpz.PositionDirection.short,
    exitDate: "2019-12-25T07:20:00",
    profit: 0.00716,
    barsHeld: 2
  },
  {
    id: "3019ab01-c32e-4431-9fbc-8896b6d8fdbf",
    direction: cpz.PositionDirection.long,
    exitDate: "2019-12-25T07:25:00",
    profit: -0.000832,
    barsHeld: 1
  },
  {
    id: "3a60ac26-76fa-4518-8723-c63c1d27e267",
    direction: cpz.PositionDirection.short,
    exitDate: "2019-12-25T07:35:00",
    profit: 0.015871,
    barsHeld: 2
  },
  {
    id: "ac142b22-03a5-4d06-abf2-51588cdf0e13",
    direction: cpz.PositionDirection.long,
    exitDate: "2019-12-25T08:30:00",
    profit: 0.093663,
    barsHeld: 11
  },
  {
    id: "c2267bdd-a82d-4610-ae4c-6f13d35c7399",
    direction: cpz.PositionDirection.short,
    exitDate: "2019-12-25T08:40:00",
    profit: -0.00024,
    barsHeld: 2
  },
  {
    id: "d26a69e1-f4b2-4d81-9247-183d49c5d7c7",
    direction: cpz.PositionDirection.long,
    exitDate: "2019-12-25T08:45:00",
    profit: -0.00644,
    barsHeld: 1
  },
  {
    id: "db9a795c-f91e-48f7-9b0b-67a1c29751ec",
    direction: cpz.PositionDirection.short,
    exitDate: "2019-12-25T09:00:00",
    profit: 0.00256,
    barsHeld: 3
  },
  {
    id: "ec1ac5ad-996d-4dfe-88a2-c5cf104f6535",
    direction: cpz.PositionDirection.long,
    exitDate: "2019-12-25T09:15:00",
    profit: 0.007423,
    barsHeld: 3
  },
  {
    id: "d20d6562-86d9-4cf7-803e-c3d7420bfeac",
    direction: cpz.PositionDirection.short,
    exitDate: "2019-12-25T10:10:00",
    profit: 0.051623,
    barsHeld: 11
  },
  {
    id: "a3e56710-7b50-488f-98b5-7a0d4d560843",
    direction: cpz.PositionDirection.long,
    exitDate: "2019-12-25T10:40:00",
    profit: -0.00744,
    barsHeld: 6
  },
  {
    id: "6643dca0-e8b6-4e1b-bd77-325a00570ec3",
    direction: cpz.PositionDirection.short,
    exitDate: "2019-12-25T10:50:00",
    profit: -0.00024,
    barsHeld: 2
  },
  {
    id: "33bf17fd-3562-4cd6-b6ec-3fed597d8fc2",
    direction: cpz.PositionDirection.long,
    exitDate: "2019-12-25T11:35:00",
    profit: -0.00164,
    barsHeld: 9
  },
  {
    id: "2e041ece-6743-49b3-9135-81991eca8366",
    direction: cpz.PositionDirection.short,
    exitDate: "2019-12-25T12:15:00",
    profit: 0.014252,
    barsHeld: 8
  },
  {
    id: "2b852059-7a38-4485-a7de-9d977a307c79",
    direction: cpz.PositionDirection.long,
    exitDate: "2019-12-25T12:50:00",
    profit: 0.038852,
    barsHeld: 7
  },
  {
    id: "93fb9331-d39d-4027-ada4-13c1f2f2bf01",
    direction: cpz.PositionDirection.short,
    exitDate: "2019-12-25T14:05:00",
    profit: 0.10276,
    barsHeld: 15
  },
  {
    id: "9b15f295-5192-4520-937a-b032a2943e26",
    direction: cpz.PositionDirection.long,
    exitDate: "2019-12-25T14:25:00",
    profit: 0.01616,
    barsHeld: 4
  },
  {
    id: "1cdb1294-55bf-431c-84a9-b60bc757309f",
    direction: cpz.PositionDirection.short,
    exitDate: "2019-12-25T14:35:00",
    profit: -0.000083,
    barsHeld: 2
  },
  {
    id: "3acf4b3e-3b3e-4ffd-adf5-92973b0d7630",
    direction: cpz.PositionDirection.long,
    exitDate: "2019-12-25T15:10:00",
    profit: -0.011283,
    barsHeld: 7
  },
  {
    id: "3e3594bc-19d3-44f9-a527-8b897e25629e",
    direction: cpz.PositionDirection.short,
    exitDate: "2019-12-25T15:40:00",
    profit: -0.00744,
    barsHeld: 6
  },
  {
    id: "8d826a0c-fde8-41fc-9592-3b2e0b1957f2",
    direction: cpz.PositionDirection.long,
    exitDate: "2019-12-25T16:15:00",
    profit: -0.00244,
    barsHeld: 7
  },
  {
    id: "59a13566-abe8-4b21-8925-1e575fb8cb79",
    direction: cpz.PositionDirection.short,
    exitDate: "2019-12-25T17:00:00",
    profit: 0.11396,
    barsHeld: 9
  },
  {
    id: "cd30d9fb-805f-4dee-baa3-b9f679adb18a",
    direction: cpz.PositionDirection.long,
    exitDate: "2019-12-25T17:05:00",
    profit: -0.00704,
    barsHeld: 1
  },
  {
    id: "0570c9cb-20f2-44d1-b073-312537a31f9c",
    direction: cpz.PositionDirection.short,
    exitDate: "2019-12-25T17:10:00",
    profit: -0.05504,
    barsHeld: 1
  },
  {
    id: "84db3c5c-d941-4b46-8ddf-f6745d00872e",
    direction: cpz.PositionDirection.long,
    exitDate: "2019-12-25T17:25:00",
    profit: -0.01304,
    barsHeld: 3
  },
  {
    id: "b038a56e-6bac-432b-88f4-af535d842fb4",
    direction: cpz.PositionDirection.short,
    exitDate: "2019-12-25T18:15:00",
    profit: 0.00756,
    barsHeld: 10
  },
  {
    id: "a8375a50-4bd9-4ab7-b340-da5335a0623a",
    direction: cpz.PositionDirection.long,
    exitDate: "2019-12-25T18:20:00",
    profit: -0.001809,
    barsHeld: 1
  },
  {
    id: "186f90c0-d4de-433d-b1c4-d4eb9bbc7d15",
    direction: cpz.PositionDirection.short,
    exitDate: "2019-12-25T18:30:00",
    profit: -0.002609,
    barsHeld: 2
  },
  {
    id: "c9281a33-64cc-4e0c-a5ec-4ccaefd68377",
    direction: cpz.PositionDirection.long,
    exitDate: "2019-12-25T20:10:00",
    profit: 0.19616,
    barsHeld: 20
  },
  {
    id: "1547c125-8f05-4703-90c5-ff5b24b43847",
    direction: cpz.PositionDirection.short,
    exitDate: "2019-12-25T20:20:00",
    profit: 0.02156,
    barsHeld: 2
  },
  {
    id: "9dbd8b0a-ba9c-4c3a-8afa-16e72bbbcb52",
    direction: cpz.PositionDirection.long,
    exitDate: "2019-12-25T20:30:00",
    profit: 0.01396,
    barsHeld: 2
  },
  {
    id: "9d512f45-0f9c-4826-9bc4-2b9b4182ee75",
    direction: cpz.PositionDirection.short,
    exitDate: "2019-12-25T20:35:00",
    profit: -0.00324,
    barsHeld: 1
  },
  {
    id: "c21e4be8-1bef-4a6d-b71d-bfea9d72d2a9",
    direction: cpz.PositionDirection.long,
    exitDate: "2019-12-25T20:45:00",
    profit: 0.009679,
    barsHeld: 2
  },
  {
    id: "aed38fcd-93b1-42c2-a4a4-71cad1ec9f97",
    direction: cpz.PositionDirection.short,
    exitDate: "2019-12-25T20:50:00",
    profit: -0.016521,
    barsHeld: 1
  },
  {
    id: "99f7e380-e580-42af-8e06-fdffe47b7191",
    direction: cpz.PositionDirection.long,
    exitDate: "2019-12-25T20:55:00",
    profit: -0.07124,
    barsHeld: 1
  },
  {
    id: "0652a72d-4dc2-465b-bc4a-31bbf65b8636",
    direction: cpz.PositionDirection.short,
    exitDate: "2019-12-25T21:10:00",
    profit: -0.03184,
    barsHeld: 3
  },
  {
    id: "e4b64342-4a36-41df-9070-93b7892d2863",
    direction: cpz.PositionDirection.long,
    exitDate: "2019-12-25T21:15:00",
    profit: -0.02084,
    barsHeld: 1
  },
  {
    id: "2f599f36-88fd-453f-aeae-78edd9335903",
    direction: cpz.PositionDirection.short,
    exitDate: "2019-12-25T21:20:00",
    profit: -0.021176,
    barsHeld: 1
  },
  {
    id: "5b0b7be9-95e2-4c89-bd99-e713d50b58c0",
    direction: cpz.PositionDirection.long,
    exitDate: "2019-12-25T21:30:00",
    profit: -0.024776,
    barsHeld: 2
  },
  {
    id: "b277c8b0-b95e-43f3-9a62-5d3b70a162ae",
    direction: cpz.PositionDirection.short,
    exitDate: "2019-12-25T22:23:29.394",
    profit: 0.07316,
    barsHeld: 10
  },
  {
    id: "56df64e1-313e-47d5-9fc5-f08fd0425c4a",
    direction: cpz.PositionDirection.long,
    exitDate: "2019-12-25T22:43:27.429",
    profit: 0.00616,
    barsHeld: 4
  },
  {
    id: "c1a797f5-deea-4c60-acb9-f892c5485dba",
    direction: cpz.PositionDirection.short,
    exitDate: "2019-12-25T22:49:22.238",
    profit: -0.02384,
    barsHeld: 1
  },
  {
    id: "98924806-e6eb-41b3-8d4e-00fd0cb54578",
    direction: cpz.PositionDirection.long,
    exitDate: "2019-12-25T23:03:25.234",
    profit: 0.00416,
    barsHeld: 3
  },
  {
    id: "4b00b1cd-1f6e-4b50-a0ef-1a31a42ef61e",
    direction: cpz.PositionDirection.short,
    exitDate: "2019-12-26T00:03:25.216",
    profit: 0.01916,
    barsHeld: 12
  },
  {
    id: "874f6ad8-627c-4a24-a256-3a2f22e2f3a0",
    direction: cpz.PositionDirection.long,
    exitDate: "2019-12-26T00:22:00.541",
    profit: 0.01876,
    barsHeld: 4
  },
  {
    id: "06c692f2-b697-4c2d-8caa-92c0192d88ef",
    direction: cpz.PositionDirection.short,
    exitDate: "2019-12-26T01:18:32.702",
    profit: 0.02496,
    barsHeld: 11
  },
  {
    id: "9b9634ed-f41d-45ff-8db7-a452ab93e0cc",
    direction: cpz.PositionDirection.long,
    exitDate: "2019-12-26T01:34:13.446",
    profit: 0.00036,
    barsHeld: 3
  },
  {
    id: "263dfe76-4b88-46de-8f49-925c6bcb829a",
    direction: cpz.PositionDirection.short,
    exitDate: "2019-12-26T01:52:47.209",
    profit: -0.00004,
    barsHeld: 4
  },
  {
    id: "1414dfeb-295b-4848-beb7-615fb072a606",
    direction: cpz.PositionDirection.long,
    exitDate: "2019-12-26T02:28:47.03",
    profit: 0.01216,
    barsHeld: 7
  },
  {
    id: "00e63098-d05e-47af-b58f-73726c2168e9",
    direction: cpz.PositionDirection.short,
    exitDate: "2019-12-26T04:18:29.091",
    profit: 0.04096,
    barsHeld: 22
  },
  {
    id: "a301a930-71f4-488c-99a6-0caf83fc9162",
    direction: cpz.PositionDirection.long,
    exitDate: "2019-12-26T04:40:27.065",
    profit: 0.00476,
    barsHeld: 5
  },
  {
    id: "e718e3f5-535b-4497-9bfb-f03717960885",
    direction: cpz.PositionDirection.short,
    exitDate: "2019-12-26T05:28:25.565",
    profit: 0.00576,
    barsHeld: 9
  },
  {
    id: "6fdee10b-d4bf-4812-9680-89e78c863a02",
    direction: cpz.PositionDirection.long,
    exitDate: "2019-12-26T05:47:16.578",
    profit: 0.00476,
    barsHeld: 4
  },
  {
    id: "4cdb6d82-0038-4bf1-bb7c-0d133bf711c6",
    direction: cpz.PositionDirection.short,
    exitDate: "2019-12-26T06:06:04.427",
    profit: 0.01776,
    barsHeld: 4
  },
  {
    id: "97597be1-4dbe-4062-a1de-061a1437fc78",
    direction: cpz.PositionDirection.long,
    exitDate: "2019-12-26T06:50:05.431",
    profit: 0.06396,
    barsHeld: 9
  },
  {
    id: "69c76ffa-df54-4c72-8c37-268e1fc47a8b",
    direction: cpz.PositionDirection.short,
    exitDate: "2019-12-26T07:32:17.875",
    profit: 0.01156,
    barsHeld: 8
  },
  {
    id: "b877b58b-5af2-448b-b730-a32b98e5c5d6",
    direction: cpz.PositionDirection.long,
    exitDate: "2019-12-26T07:40:41.344",
    profit: 0.00339,
    barsHeld: 2
  },
  {
    id: "f8775cd7-550f-4a64-882a-93ea8103f279",
    direction: cpz.PositionDirection.short,
    exitDate: "2019-12-26T07:57:48.167",
    profit: 0.00219,
    barsHeld: 3
  },
  {
    id: "628a8f62-94d7-40b9-ba0c-05dfc2906f7e",
    direction: cpz.PositionDirection.long,
    exitDate: "2019-12-26T08:25:29.405",
    profit: 0.04676,
    barsHeld: 6
  },
  {
    id: "716d30ea-eadd-40c8-9e65-f8b495d58c43",
    direction: cpz.PositionDirection.short,
    exitDate: "2019-12-26T08:37:57.415",
    profit: -0.00284,
    barsHeld: 2
  },
  {
    id: "271e7202-da07-4f4f-958f-dabf534a99c5",
    direction: cpz.PositionDirection.long,
    exitDate: "2019-12-26T08:52:27.383",
    profit: 0.00216,
    barsHeld: 3
  },
  {
    id: "f5ae5641-4247-47bb-853c-b7043b95859b",
    direction: cpz.PositionDirection.short,
    exitDate: "2019-12-26T09:11:23.472",
    profit: 0.00436,
    barsHeld: 4
  },
  {
    id: "f281d314-6225-4e45-8cd4-f6678f03aac9",
    direction: cpz.PositionDirection.long,
    exitDate: "2019-12-26T09:18:05.527",
    profit: -0.000073,
    barsHeld: 1
  },
  {
    id: "6378d06a-be01-4c09-8be1-67307125f4c3",
    direction: cpz.PositionDirection.short,
    exitDate: "2019-12-26T09:33:09.273",
    profit: 0.000727,
    barsHeld: 3
  },
  {
    id: "bd0d9f07-4a72-4451-8c2b-b2267a1d9fb3",
    direction: cpz.PositionDirection.long,
    exitDate: "2019-12-26T09:39:23.18",
    profit: -0.00404,
    barsHeld: 1
  },
  {
    id: "805c6e0a-b14f-4a40-ab51-a848c51b2ba5",
    direction: cpz.PositionDirection.short,
    exitDate: "2019-12-26T10:20:32.819",
    profit: 0.01576,
    barsHeld: 9
  },
  {
    id: "649c29f2-94b0-45c3-9434-430b5eb63ef8",
    direction: cpz.PositionDirection.long,
    exitDate: "2019-12-26T10:56:26.454",
    profit: 0.01016,
    barsHeld: 7
  },
  {
    id: "1f3b46cc-8471-44a9-8d9d-c181a2d1508a",
    direction: cpz.PositionDirection.short,
    exitDate: "2019-12-26T11:06:58.092",
    profit: -0.00004,
    barsHeld: 2
  },
  {
    id: "81de8bac-f013-49ba-892f-3a3e07604333",
    direction: cpz.PositionDirection.long,
    exitDate: "2019-12-26T11:10:02.229",
    profit: -0.010409,
    barsHeld: 1
  },
  {
    id: "314255c9-489d-442a-8c0b-ddaeb409b1dd",
    direction: cpz.PositionDirection.short,
    exitDate: "2019-12-26T11:40:55.302",
    profit: 0.037991,
    barsHeld: 6
  },
  {
    id: "1dfd793d-a369-4197-8d53-4f111553aaa3",
    direction: cpz.PositionDirection.long,
    exitDate: "2019-12-26T11:46:52.327",
    profit: -0.00004,
    barsHeld: 1
  },
  {
    id: "eb24fb90-5d83-4b75-be29-e00f8ae920e4",
    direction: cpz.PositionDirection.short,
    exitDate: "2019-12-26T12:06:19.554",
    profit: 0.01256,
    barsHeld: 4
  },
  {
    id: "e2035479-0516-48bf-be4d-34b477719ad8",
    direction: cpz.PositionDirection.long,
    exitDate: "2019-12-26T13:09:25.533",
    profit: 0.05136,
    barsHeld: 12
  },
  {
    id: "977c3c51-2e58-4cf2-ad05-9cbceab6eede",
    direction: cpz.PositionDirection.short,
    exitDate: "2019-12-26T13:33:00.383",
    profit: 0.02396,
    barsHeld: 5
  },
  {
    id: "94de7f77-6221-496e-9a38-9dc40e11e336",
    direction: cpz.PositionDirection.long,
    exitDate: "2019-12-26T14:03:25.606",
    profit: 0.015388,
    barsHeld: 6
  },
  {
    id: "7cbe9972-1e5c-4583-ba1d-f5078f8941aa",
    direction: cpz.PositionDirection.short,
    exitDate: "2019-12-26T14:09:05.204",
    profit: -0.000212,
    barsHeld: 1
  },
  {
    id: "cc8e096f-a26b-46e8-9dd9-1f095c4565b6",
    direction: cpz.PositionDirection.long,
    exitDate: "2019-12-26T14:17:14.035",
    profit: 0.00736,
    barsHeld: 2
  },
  {
    id: "83f248cb-09f0-49fd-b069-6d69c7784aac",
    direction: cpz.PositionDirection.short,
    exitDate: "2019-12-26T14:37:17.168",
    profit: 0.00796,
    barsHeld: 4
  },
  {
    id: "419069f5-96fd-4252-8498-73d021bc2026",
    direction: cpz.PositionDirection.long,
    exitDate: "2019-12-27T23:06:10.638",
    profit: 0.08856,
    barsHeld: 390
  },
  {
    id: "296609e2-32b0-4aaf-80ef-714b767deb15",
    direction: cpz.PositionDirection.short,
    exitDate: "2019-12-27T23:51:32.189",
    profit: -0.00784,
    barsHeld: 9
  },
  {
    id: "d115730c-8300-4087-8e1a-4229ba50bdb3",
    direction: cpz.PositionDirection.long,
    exitDate: "2019-12-28T00:07:51.211",
    profit: 0.009351,
    barsHeld: 3
  },
  {
    id: "29b20145-8c1f-4b8d-8618-ea63cd1de520",
    direction: cpz.PositionDirection.short,
    exitDate: "2019-12-28T00:24:41.451",
    profit: -0.006849,
    barsHeld: 3
  },
  {
    id: "e0922d28-346f-48dd-9933-e7292ef831ce",
    direction: cpz.PositionDirection.long,
    exitDate: "2019-12-28T00:52:37.042",
    profit: 0.10356,
    barsHeld: 6
  },
  {
    id: "4cfdd7bf-250b-431a-8b75-9a684ca6e38d",
    direction: cpz.PositionDirection.short,
    exitDate: "2019-12-28T01:00:03.335",
    profit: -0.00864,
    barsHeld: 2
  },
  {
    id: "5c6891a0-ce6e-461b-b245-aee1fa52924b",
    direction: cpz.PositionDirection.long,
    exitDate: "2019-12-28T01:05:02.285",
    profit: -0.00004,
    barsHeld: 1
  },
  {
    id: "2f2fe1f4-d51a-4ebf-b7fe-f8cff77724a4",
    direction: cpz.PositionDirection.short,
    exitDate: "2019-12-28T01:30:01.375",
    profit: -0.00704,
    barsHeld: 4
  },
  {
    id: "75029b6d-d260-4796-9165-b882303ab0d5",
    direction: cpz.PositionDirection.long,
    exitDate: "2019-12-28T01:33:26.237",
    profit: -0.020096,
    barsHeld: 1
  },
  {
    id: "c0d16f6f-4149-4047-b0e6-aa73ddc7435b",
    direction: cpz.PositionDirection.short,
    exitDate: "2019-12-28T01:39:37.442",
    profit: -0.022496,
    barsHeld: 1
  },
  {
    id: "a27e008f-b17c-4df4-bf08-d4e738a72d0f",
    direction: cpz.PositionDirection.long,
    exitDate: "2019-12-28T01:51:31.456",
    profit: 0.00276,
    barsHeld: 3
  },
  {
    id: "fac86d51-00c1-4b31-b949-3261b952318e",
    direction: cpz.PositionDirection.short,
    exitDate: "2019-12-28T02:02:08.74",
    profit: 0.00716,
    barsHeld: 2
  },
  {
    id: "412f11d7-532b-4d9b-b1f1-ec7f2ad4cefd",
    direction: cpz.PositionDirection.long,
    exitDate: "2019-12-28T02:11:04.223",
    profit: 0.02116,
    barsHeld: 2
  },
  {
    id: "d2c27fc7-c1e8-4edf-a01a-cf1755bb2af2",
    direction: cpz.PositionDirection.short,
    exitDate: "2019-12-28T02:37:13.177",
    profit: 0.06196,
    barsHeld: 5
  },
  {
    id: "88b9e89b-62e8-4dc7-9f01-052fbb999d82",
    direction: cpz.PositionDirection.long,
    exitDate: "2019-12-28T03:20:42.082",
    profit: 0.01356,
    barsHeld: 9
  },
  {
    id: "41bd5960-e192-4dc1-bebc-7996df5b2ff3",
    direction: cpz.PositionDirection.short,
    exitDate: "2019-12-28T03:45:35.04",
    profit: 0.00536,
    barsHeld: 5
  },
  {
    id: "bb4d952b-6d3e-41b1-b42c-f6db29185135",
    direction: cpz.PositionDirection.long,
    exitDate: "2019-12-28T04:57:27.021",
    profit: 0.01676,
    barsHeld: 14
  },
  {
    id: "9fb1b0b2-8195-4f9d-8ac0-43b05d744c6f",
    direction: cpz.PositionDirection.short,
    exitDate: "2019-12-28T05:00:04.359",
    profit: -0.00044,
    barsHeld: 1
  },
  {
    id: "191b5ffe-7bc2-43c2-b6a9-0ffa3e6be137",
    direction: cpz.PositionDirection.long,
    exitDate: "2019-12-28T05:29:49.77",
    profit: 0.021824,
    barsHeld: 5
  },
  {
    id: "bc7ebad2-31b2-4200-9638-d180b2038fed",
    direction: cpz.PositionDirection.short,
    exitDate: "2019-12-28T05:35:12.225",
    profit: 0.000544,
    barsHeld: 2
  },
  {
    id: "ac95262d-c2be-4c83-9002-79729fc854e1",
    direction: cpz.PositionDirection.long,
    exitDate: "2019-12-28T06:16:24.343",
    profit: 0.051679,
    barsHeld: 8
  },
  {
    id: "58fe5db0-9334-45fa-bec3-769a8fd3eb11",
    direction: cpz.PositionDirection.short,
    exitDate: "2019-12-28T06:28:48.485",
    profit: 0.00936,
    barsHeld: 2
  },
  {
    id: "c57651b5-2e4e-4d18-82ae-64158f611339",
    direction: cpz.PositionDirection.long,
    exitDate: "2019-12-28T06:36:59.522",
    profit: -0.009816,
    barsHeld: 2
  },
  {
    id: "bd970eec-ba11-43fa-86e7-fa57f76e2897",
    direction: cpz.PositionDirection.short,
    exitDate: "2019-12-28T07:06:54.169",
    profit: 0.044584,
    barsHeld: 6
  },
  {
    id: "ec6cd363-d6b8-4bc9-a4af-63b06a232461",
    direction: cpz.PositionDirection.long,
    exitDate: "2019-12-28T07:27:55.41",
    profit: 0.00716,
    barsHeld: 4
  },
  {
    id: "df914a9e-ee79-468e-8d8d-a79a8bc543ee",
    direction: cpz.PositionDirection.short,
    exitDate: "2019-12-28T08:00:03.05",
    profit: 0.023997,
    barsHeld: 7
  },
  {
    id: "948fc84e-7335-4965-8992-50ea07bd20ad",
    direction: cpz.PositionDirection.long,
    exitDate: "2019-12-28T08:08:21.198",
    profit: -0.014203,
    barsHeld: 1
  },
  {
    id: "bb861bde-ec03-4f98-9a6a-c3e33c64fa3e",
    direction: cpz.PositionDirection.short,
    exitDate: "2019-12-28T08:19:15.235",
    profit: 0.02136,
    barsHeld: 2
  },
  {
    id: "dcfc1934-3433-49d8-a94b-156f5962bf51",
    direction: cpz.PositionDirection.long,
    exitDate: "2019-12-28T08:25:27.19",
    profit: -0.00024,
    barsHeld: 2
  },
  {
    id: "d01999e2-8b44-4f1d-8e03-22eefaf5f15c",
    direction: cpz.PositionDirection.short,
    exitDate: "2019-12-28T08:36:57.268",
    profit: 0.008719,
    barsHeld: 2
  },
  {
    id: "b78a527a-74ed-443b-87fa-ee32eaf13c66",
    direction: cpz.PositionDirection.long,
    exitDate: "2019-12-28T09:05:34.425",
    profit: 0.029319,
    barsHeld: 6
  },
  {
    id: "49cdab5c-496d-4db8-9c86-a0587513262a",
    direction: cpz.PositionDirection.short,
    exitDate: "2019-12-28T09:23:33.308",
    profit: 0.01116,
    barsHeld: 3
  },
  {
    id: "0b6861a6-ed39-4c22-aeb7-0362255ed2f4",
    direction: cpz.PositionDirection.long,
    exitDate: "2019-12-28T10:20:59.598",
    profit: 0.01996,
    barsHeld: 12
  },
  {
    id: "dee7c611-f262-4248-b648-5ebff4a71481",
    direction: cpz.PositionDirection.short,
    exitDate: "2019-12-28T10:30:56.212",
    profit: -0.00324,
    barsHeld: 2
  },
  {
    id: "475072fb-160c-425c-b730-1ba09e841879",
    direction: cpz.PositionDirection.long,
    exitDate: "2019-12-28T11:03:22.043",
    profit: -0.00164,
    barsHeld: 6
  },
  {
    id: "3265958f-5cad-4419-882a-6fe0cc91c1f8",
    direction: cpz.PositionDirection.short,
    exitDate: "2019-12-28T11:43:16.289",
    profit: 0.01896,
    barsHeld: 8
  },
  {
    id: "36b805aa-ddca-4b36-94d4-5ffa11774728",
    direction: cpz.PositionDirection.long,
    exitDate: "2019-12-28T12:18:24.64",
    profit: 0.02336,
    barsHeld: 7
  },
  {
    id: "4189b294-0cc3-4d9d-881a-084e19389a3d",
    direction: cpz.PositionDirection.short,
    exitDate: "2019-12-28T12:26:12.06",
    profit: -0.00464,
    barsHeld: 2
  },
  {
    id: "a1f7ac3f-c7a6-49ea-8a0c-abdb3ff4fe8e",
    direction: cpz.PositionDirection.long,
    exitDate: "2019-12-28T12:59:08.476",
    profit: 0.00476,
    barsHeld: 6
  },
  {
    id: "78028352-b312-4dfb-bf42-af52def8a84b",
    direction: cpz.PositionDirection.short,
    exitDate: "2019-12-28T13:41:22.412",
    profit: 0.02336,
    barsHeld: 9
  },
  {
    id: "be1d9bd5-f1f4-49e6-9d0e-ed8d2d64f502",
    direction: cpz.PositionDirection.long,
    exitDate: "2019-12-28T13:45:30.672",
    profit: -0.00024,
    barsHeld: 1
  },
  {
    id: "3382c92b-0d3f-499b-802a-f7810affb4d6",
    direction: cpz.PositionDirection.short,
    exitDate: "2019-12-28T14:05:30.372",
    profit: -0.00464,
    barsHeld: 4
  },
  {
    id: "143c60eb-5b7f-4be1-a74c-15c797c10e19",
    direction: cpz.PositionDirection.long,
    exitDate: "2019-12-28T14:25:30.229",
    profit: 0.04576,
    barsHeld: 4
  },
  {
    id: "990654c6-c43d-4061-a026-cb5e37c43497",
    direction: cpz.PositionDirection.short,
    exitDate: "2019-12-28T14:40:33.34",
    profit: 0.00776,
    barsHeld: 3
  },
  {
    id: "8165eb8a-e76e-4a01-a313-f18b721a407a",
    direction: cpz.PositionDirection.long,
    exitDate: "2019-12-28T15:00:30.632",
    profit: 0.01911,
    barsHeld: 4
  },
  {
    id: "0064da3f-d0be-4bde-8273-f20a3fca82dd",
    direction: cpz.PositionDirection.short,
    exitDate: "2019-12-28T15:09:28.576",
    profit: -0.00009,
    barsHeld: 1
  },
  {
    id: "93d2562e-128c-42b3-b679-eb0ad4c651dc",
    direction: cpz.PositionDirection.long,
    exitDate: "2019-12-28T15:23:18.375",
    profit: 0.002115,
    barsHeld: 3
  },
  {
    id: "3c0c5786-84a4-4264-aa38-8d0bfba95f60",
    direction: cpz.PositionDirection.short,
    exitDate: "2019-12-28T15:53:27.415",
    profit: 0.038115,
    barsHeld: 6
  },
  {
    id: "84962db9-b93e-4035-be56-5302f99d3f7f",
    direction: cpz.PositionDirection.long,
    exitDate: "2019-12-28T16:01:17.492",
    profit: -0.010383,
    barsHeld: 2
  },
  {
    id: "b8a84c97-62af-41b0-95d0-cf329763c586",
    direction: cpz.PositionDirection.short,
    exitDate: "2019-12-28T16:13:44.317",
    profit: -0.010709,
    barsHeld: 2
  },
  {
    id: "07f1c41f-58f4-43f0-93ff-44eaa96ae580",
    direction: cpz.PositionDirection.long,
    exitDate: "2019-12-28T16:56:41.441",
    profit: 0.015634,
    barsHeld: 9
  },
  {
    id: "3acaf216-c309-4ce6-88f6-1ac778b0385c",
    direction: cpz.PositionDirection.short,
    exitDate: "2019-12-28T17:36:23.216",
    profit: -0.01584,
    barsHeld: 8
  },
  {
    id: "df0c692a-19a5-48f1-bf1c-f65a4164f412",
    direction: cpz.PositionDirection.long,
    exitDate: "2019-12-28T18:09:48.472",
    profit: 0.03656,
    barsHeld: 6
  },
  {
    id: "0bca6519-8208-4cd5-9b7b-d467e18ba4e7",
    direction: cpz.PositionDirection.short,
    exitDate: "2019-12-28T18:16:40.385",
    profit: -0.00244,
    barsHeld: 2
  },
  {
    id: "64a7139b-7f2e-4fcd-8feb-ec2c0aafdb4c",
    direction: cpz.PositionDirection.long,
    exitDate: "2019-12-28T18:41:08.216",
    profit: 0.01416,
    barsHeld: 5
  },
  {
    id: "2b3d6e62-1948-4d1b-8999-2b317d62a5a5",
    direction: cpz.PositionDirection.short,
    exitDate: "2019-12-28T19:16:45.616",
    profit: 0.03416,
    barsHeld: 7
  },
  {
    id: "bcb96314-1dd8-4765-bf89-de9fda925479",
    direction: cpz.PositionDirection.long,
    exitDate: "2019-12-28T19:44:33.168",
    profit: -0.00004,
    barsHeld: 5
  },
  {
    id: "90c15f0f-9145-410e-ba77-b6b4622fa173",
    direction: cpz.PositionDirection.short,
    exitDate: "2019-12-28T20:04:02.404",
    profit: -0.01144,
    barsHeld: 4
  },
  {
    id: "417fe3b2-ca48-43b5-84f0-522cc2abb9e7",
    direction: cpz.PositionDirection.long,
    exitDate: "2019-12-28T20:25:15.843",
    profit: 0.00836,
    barsHeld: 5
  },
  {
    id: "07c2f4cf-1f31-40d4-a85e-48f3f76aba86",
    direction: cpz.PositionDirection.short,
    exitDate: "2019-12-28T21:00:56.048",
    profit: 0.01496,
    barsHeld: 7
  },
  {
    id: "214ee52b-6f9e-4500-97a4-29932578b657",
    direction: cpz.PositionDirection.long,
    exitDate: "2019-12-28T21:09:54.274",
    profit: -0.01544,
    barsHeld: 1
  },
  {
    id: "ba691725-c6fe-4a5d-b5d3-4564ca0d8fd9",
    direction: cpz.PositionDirection.short,
    exitDate: "2019-12-28T21:49:03.683",
    profit: -0.00224,
    barsHeld: 8
  },
  {
    id: "ba32755d-7750-4c31-87a8-90baa62f9c11",
    direction: cpz.PositionDirection.long,
    exitDate: "2019-12-28T21:59:36.266",
    profit: -0.00044,
    barsHeld: 2
  },
  {
    id: "36ebc986-8878-44a3-b6db-45a6ee4df2f5",
    direction: cpz.PositionDirection.short,
    exitDate: "2019-12-28T22:13:58.228",
    profit: 0.04116,
    barsHeld: 3
  },
  {
    id: "2c76c5e9-4ab6-4909-9cda-66e4f4363a99",
    direction: cpz.PositionDirection.long,
    exitDate: "2019-12-28T22:21:48.128",
    profit: 0.00816,
    barsHeld: 2
  },
  {
    id: "f3923609-b0aa-4a76-8881-2b1b9b33c047",
    direction: cpz.PositionDirection.short,
    exitDate: "2019-12-28T22:33:36.449",
    profit: 0.00696,
    barsHeld: 2
  },
  {
    id: "647de7af-1854-4660-bd59-ed7e49b3383f",
    direction: cpz.PositionDirection.long,
    exitDate: "2019-12-28T23:29:35.479",
    profit: 0.012649,
    barsHeld: 11
  },
  {
    id: "2b3a74c5-2230-4da3-b377-a38ab2c77d25",
    direction: cpz.PositionDirection.short,
    exitDate: "2019-12-28T23:47:59.312",
    profit: 0.018249,
    barsHeld: 4
  },
  {
    id: "4c0202b1-a8e1-47a4-8495-4dd723548116",
    direction: cpz.PositionDirection.long,
    exitDate: "2019-12-28T23:53:51.149",
    profit: -0.01604,
    barsHeld: 1
  },
  {
    id: "421bf7e1-c362-4b07-a7dd-682de54de1d5",
    direction: cpz.PositionDirection.short,
    exitDate: "2019-12-29T00:00:49.277",
    profit: -0.00744,
    barsHeld: 2
  },
  {
    id: "a9de3340-d6a5-48b7-9a4c-354ac7a133b6",
    direction: cpz.PositionDirection.long,
    exitDate: "2019-12-29T00:05:14.693",
    profit: -0.01364,
    barsHeld: 1
  },
  {
    id: "65987c8a-1694-4fe2-b96f-f2afc561cb99",
    direction: cpz.PositionDirection.short,
    exitDate: "2019-12-29T00:10:09.485",
    profit: -0.00084,
    barsHeld: 1
  },
  {
    id: "6b253657-af1a-445c-8213-b3fbe9e739f8",
    direction: cpz.PositionDirection.long,
    exitDate: "2019-12-29T00:19:27.608",
    profit: -0.00244,
    barsHeld: 1
  },
  {
    id: "b814cefe-ddea-442f-ac12-df4c1bf922cb",
    direction: cpz.PositionDirection.short,
    exitDate: "2019-12-29T00:26:08.198",
    profit: 0.004204,
    barsHeld: 2
  },
  {
    id: "a33d9497-ce32-4171-a0b4-f19be8c7962c",
    direction: cpz.PositionDirection.long,
    exitDate: "2019-12-29T00:43:34.192",
    profit: 0.009804,
    barsHeld: 3
  },
  {
    id: "1bf93dcb-6b4f-43d6-b319-793bfff89427",
    direction: cpz.PositionDirection.short,
    exitDate: "2019-12-29T01:34:05.488",
    profit: 0.01276,
    barsHeld: 10
  },
  {
    id: "4d937557-8b41-4649-b592-a01ddb2929f6",
    direction: cpz.PositionDirection.long,
    exitDate: "2019-12-29T01:52:15.133",
    profit: 0.00496,
    barsHeld: 4
  },
  {
    id: "84c4d186-7091-4809-9f93-6a2687e7ea10",
    direction: cpz.PositionDirection.short,
    exitDate: "2019-12-29T02:04:32.208",
    profit: 0.01096,
    barsHeld: 2
  },
  {
    id: "53834f8b-2fdf-4c0e-8ac7-3ef2875ef42e",
    direction: cpz.PositionDirection.long,
    exitDate: "2019-12-29T02:51:21.68",
    profit: 0.01476,
    barsHeld: 10
  },
  {
    id: "60dcf431-cffe-49c3-a905-7a300721aec4",
    direction: cpz.PositionDirection.short,
    exitDate: "2019-12-29T03:42:07.348",
    profit: -0.00084,
    barsHeld: 10
  },
  {
    id: "bd54d71d-ace8-4314-8a10-dabfff501407",
    direction: cpz.PositionDirection.long,
    exitDate: "2019-12-29T04:57:29.441",
    profit: 0.00196,
    barsHeld: 15
  },
  {
    id: "dcd37134-5ec7-402e-8e79-4ae407306ddf",
    direction: cpz.PositionDirection.short,
    exitDate: "2019-12-29T05:33:37.331",
    profit: 0.01596,
    barsHeld: 7
  },
  {
    id: "ff52b665-e533-4bfd-a8a5-c35c95af8f2f",
    direction: cpz.PositionDirection.long,
    exitDate: "2019-12-29T06:25:17.208",
    profit: 0.04256,
    barsHeld: 11
  },
  {
    id: "0cdda4f8-7cac-4d9a-b5a9-b58213e2d909",
    direction: cpz.PositionDirection.short,
    exitDate: "2019-12-29T06:57:36.1",
    profit: 0.01356,
    barsHeld: 6
  },
  {
    id: "522e24f7-d208-4209-9300-59937fc1adb8",
    direction: cpz.PositionDirection.long,
    exitDate: "2019-12-29T07:10:10.596",
    profit: 0.014591,
    barsHeld: 3
  },
  {
    id: "ef586879-966f-480f-a285-832558304f23",
    direction: cpz.PositionDirection.short,
    exitDate: "2019-12-29T07:55:21.488",
    profit: 0.000991,
    barsHeld: 9
  },
  {
    id: "37b4ec19-2a75-424b-bf63-da104e988862",
    direction: cpz.PositionDirection.long,
    exitDate: "2019-12-29T08:36:11.245",
    profit: 0.009484,
    barsHeld: 8
  },
  {
    id: "833cf6f8-5b63-448e-b16f-f4e095a7efb1",
    direction: cpz.PositionDirection.short,
    exitDate: "2019-12-29T08:40:27.104",
    profit: -0.000116,
    barsHeld: 1
  },
  {
    id: "170d0538-99ac-4019-9b87-a4e0f493b6f1",
    direction: cpz.PositionDirection.long,
    exitDate: "2019-12-29T09:02:20.806",
    profit: 0.04736,
    barsHeld: 4
  },
  {
    id: "4c64a58a-dfe4-41b0-8645-8da4d51c0bdc",
    direction: cpz.PositionDirection.short,
    exitDate: "2019-12-29T10:09:03.128",
    profit: 0.06456,
    barsHeld: 13
  },
  {
    id: "dbac5331-c27f-47c0-aa8f-ffe4c015ca2a",
    direction: cpz.PositionDirection.long,
    exitDate: "2019-12-29T12:06:42.433",
    profit: 0.04836,
    barsHeld: 24
  },
  {
    id: "47dec001-2a78-4b4c-b88e-7ab562599122",
    direction: cpz.PositionDirection.short,
    exitDate: "2019-12-29T12:17:42.352",
    profit: 0.01536,
    barsHeld: 2
  },
  {
    id: "3236cc53-863c-42c0-92db-ce691eedb0a3",
    direction: cpz.PositionDirection.long,
    exitDate: "2019-12-29T13:03:06.712",
    profit: 0.05096,
    barsHeld: 9
  },
  {
    id: "f1520b62-6391-421f-b9aa-f3ac54898af6",
    direction: cpz.PositionDirection.short,
    exitDate: "2019-12-29T13:21:17.149",
    profit: 0.00956,
    barsHeld: 4
  },
  {
    id: "7cc03f2c-5cbf-4562-b253-df316bae6f90",
    direction: cpz.PositionDirection.long,
    exitDate: "2019-12-29T13:46:11.72",
    profit: 0.06816,
    barsHeld: 5
  },
  {
    id: "efc00f04-439c-4068-80c3-056fe8a75fba",
    direction: cpz.PositionDirection.short,
    exitDate: "2019-12-29T13:54:24.519",
    profit: -0.00024,
    barsHeld: 1
  },
  {
    id: "f0c1158c-5891-4ba0-8cc0-7d54d3296e27",
    direction: cpz.PositionDirection.long,
    exitDate: "2019-12-29T14:03:54.318",
    profit: 0.00176,
    barsHeld: 2
  },
  {
    id: "daadcd93-be6f-4dd0-9af3-a1b0cdc43e09",
    direction: cpz.PositionDirection.short,
    exitDate: "2019-12-29T14:09:13.196",
    profit: -0.039894,
    barsHeld: 1
  },
  {
    id: "cca39986-0870-464d-9d93-f66bf53d4746",
    direction: cpz.PositionDirection.long,
    exitDate: "2019-12-29T14:10:35.252",
    profit: -0.022145,
    barsHeld: 1
  },
  {
    id: "31a703e3-aacb-4492-a792-5198fb770edd",
    direction: cpz.PositionDirection.short,
    exitDate: "2019-12-29T14:23:54.357",
    profit: -0.000091,
    barsHeld: 2
  },
  {
    id: "47ae0099-6677-4b1e-8eab-99ea524f9c5e",
    direction: cpz.PositionDirection.long,
    exitDate: "2019-12-29T14:34:12.482",
    profit: 0.00876,
    barsHeld: 2
  },
  {
    id: "4eafb5cb-6609-4cab-8741-2cd3182d70d8",
    direction: cpz.PositionDirection.short,
    exitDate: "2019-12-29T14:55:53.337",
    profit: 0.01876,
    barsHeld: 5
  },
  {
    id: "3f36da19-818f-4b8c-a72f-91e7234196d1",
    direction: cpz.PositionDirection.long,
    exitDate: "2019-12-29T15:00:50.107",
    profit: -0.00684,
    barsHeld: 1
  },
  {
    id: "1f6d10ad-7fbd-4506-95a9-33dcbfb60b07",
    direction: cpz.PositionDirection.short,
    exitDate: "2019-12-29T15:11:45.188",
    profit: 0.02096,
    barsHeld: 2
  },
  {
    id: "745da435-7983-4acb-ad53-4608de13d7fa",
    direction: cpz.PositionDirection.long,
    exitDate: "2019-12-29T15:58:35.017",
    profit: 0.041331,
    barsHeld: 9
  },
  {
    id: "bb083bd5-b26d-4cec-882b-97c1415c9632",
    direction: cpz.PositionDirection.short,
    exitDate: "2019-12-29T16:07:46.544",
    profit: -0.019469,
    barsHeld: 2
  },
  {
    id: "7bcbc9eb-eab7-4e0a-8484-3afdadfaf8c0",
    direction: cpz.PositionDirection.long,
    exitDate: "2019-12-29T16:22:34.812",
    profit: 0.01696,
    barsHeld: 3
  },
  {
    id: "7d3622a4-0c6e-46e7-bc2d-499f9fc093f1",
    direction: cpz.PositionDirection.short,
    exitDate: "2019-12-29T17:08:17.4",
    profit: 0.01136,
    barsHeld: 9
  },
  {
    id: "eee9bae5-d7ff-4445-a9f6-7fbff9ed9204",
    direction: cpz.PositionDirection.long,
    exitDate: "2019-12-29T17:11:59.946",
    profit: -0.010022,
    barsHeld: 1
  },
  {
    id: "02defe5a-1d29-4b09-8192-21b987cc4760",
    direction: cpz.PositionDirection.short,
    exitDate: "2019-12-29T17:36:33.064",
    profit: 0.016778,
    barsHeld: 5
  },
  {
    id: "d15a3947-de6f-4da9-9503-39afe1da6f23",
    direction: cpz.PositionDirection.long,
    exitDate: "2019-12-29T18:24:14.712",
    profit: 0.020951,
    barsHeld: 9
  },
  {
    id: "90b1ab91-91bc-4845-911d-db9409a00a6d",
    direction: cpz.PositionDirection.short,
    exitDate: "2019-12-29T18:35:41.4",
    profit: -0.006249,
    barsHeld: 3
  },
  {
    id: "671e01c0-80c8-4daa-bc5a-ce0427dd7ba5",
    direction: cpz.PositionDirection.long,
    exitDate: "2019-12-29T19:10:02.585",
    profit: 0.02676,
    barsHeld: 7
  },
  {
    id: "8c0275c7-de1f-487a-8061-66821a763e2d",
    direction: cpz.PositionDirection.short,
    exitDate: "2019-12-29T19:20:43.147",
    profit: -0.00264,
    barsHeld: 2
  },
  {
    id: "590970b5-a2aa-479e-9ae8-3c4b2a7f72da",
    direction: cpz.PositionDirection.long,
    exitDate: "2019-12-29T20:01:02.24",
    profit: 0.07156,
    barsHeld: 8
  },
  {
    id: "c1bbe241-f388-4eec-823e-8630aa819de0",
    direction: cpz.PositionDirection.short,
    exitDate: "2019-12-29T20:10:42.67",
    profit: -0.02804,
    barsHeld: 2
  },
  {
    id: "05371a44-d502-4fa9-bb5d-aceed02b9349",
    direction: cpz.PositionDirection.long,
    exitDate: "2019-12-29T20:29:03.172",
    profit: 0.04216,
    barsHeld: 3
  },
  {
    id: "9b50adb4-f540-43e8-b51d-79f393613cca",
    direction: cpz.PositionDirection.short,
    exitDate: "2019-12-29T20:45:25.934",
    profit: 0.14036,
    barsHeld: 4
  },
  {
    id: "76587410-4b52-460c-8348-010b0fbea2e3",
    direction: cpz.PositionDirection.long,
    exitDate: "2019-12-29T20:50:02.383",
    profit: -0.07544,
    barsHeld: 1
  },
  {
    id: "71ef3469-37b6-4510-a24c-7aadbe2c5992",
    direction: cpz.PositionDirection.short,
    exitDate: "2019-12-29T20:57:29.44",
    profit: -0.01204,
    barsHeld: 1
  },
  {
    id: "40021f6d-0172-4f56-8829-dcad24798f6f",
    direction: cpz.PositionDirection.long,
    exitDate: "2019-12-29T21:03:30.084",
    profit: -0.03204,
    barsHeld: 1
  },
  {
    id: "0d008a0f-e011-4260-93ec-8025c7d843a7",
    direction: cpz.PositionDirection.short,
    exitDate: "2019-12-29T21:17:17.446",
    profit: -0.01804,
    barsHeld: 3
  },
  {
    id: "9afa34e1-ffaa-43d7-8e22-b72962180175",
    direction: cpz.PositionDirection.long,
    exitDate: "2019-12-29T21:24:47.14",
    profit: -0.02264,
    barsHeld: 1
  },
  {
    id: "7d1592df-16a1-48f0-a54b-7c84fd6fbc27",
    direction: cpz.PositionDirection.short,
    exitDate: "2019-12-29T21:35:03.084",
    profit: -0.02224,
    barsHeld: 3
  },
  {
    id: "e2475a2b-8e73-456a-8192-9dd61b219838",
    direction: cpz.PositionDirection.long,
    exitDate: "2019-12-29T21:57:54.42",
    profit: 0.02436,
    barsHeld: 4
  },
  {
    id: "ef3da94e-fdfe-4987-aa73-6c4515f6f6cc",
    direction: cpz.PositionDirection.short,
    exitDate: "2019-12-29T22:07:22.96",
    profit: -0.00784,
    barsHeld: 2
  },
  {
    id: "7c338500-5d42-441a-a100-4ade18ab7271",
    direction: cpz.PositionDirection.long,
    exitDate: "2019-12-29T22:35:35.515",
    profit: 0.031713,
    barsHeld: 6
  },
  {
    id: "b1001173-9559-4b81-8fba-ba1ed9bd34f2",
    direction: cpz.PositionDirection.short,
    exitDate: "2019-12-29T22:48:34.633",
    profit: -0.000087,
    barsHeld: 2
  },
  {
    id: "ef3eb16a-afef-42f8-8211-7de6c665d85d",
    direction: cpz.PositionDirection.long,
    exitDate: "2019-12-29T22:56:14.225",
    profit: -0.02684,
    barsHeld: 2
  },
  {
    id: "9bc5aa7e-119c-42d5-9f24-f777ee0257db",
    direction: cpz.PositionDirection.short,
    exitDate: "2019-12-29T23:21:48.133",
    profit: -0.01204,
    barsHeld: 5
  },
  {
    id: "14dfa93e-71a5-47bd-b260-adb1109d7245",
    direction: cpz.PositionDirection.long,
    exitDate: "2019-12-29T23:43:35.141",
    profit: -0.02064,
    barsHeld: 4
  },
  {
    id: "f681bf8f-240e-4aea-a5e5-06eed45882c0",
    direction: cpz.PositionDirection.short,
    exitDate: "2019-12-30T00:31:00.392",
    profit: 0.12256,
    barsHeld: 10
  },
  {
    id: "3a3c0f1a-1e7f-479d-b21c-a197d1ced2a0",
    direction: cpz.PositionDirection.long,
    exitDate: "2019-12-30T00:55:33.392",
    profit: 0.02376,
    barsHeld: 5
  },
  {
    id: "b5b3bead-fc05-4c8a-80fb-d4193d98864c",
    direction: cpz.PositionDirection.short,
    exitDate: "2019-12-30T01:05:55.096",
    profit: 0.00236,
    barsHeld: 2
  },
  {
    id: "de86ae21-7199-4839-9de2-a3273768dc9a",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-01-10T04:37:04.677",
    profit: 0.79716,
    barsHeld: 3210
  },
  {
    id: "5d038299-da47-4ae3-bcaa-815478aefa5a",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-01-10T04:50:11.311",
    profit: -0.01644,
    barsHeld: 3
  },
  {
    id: "3e7a44e1-3c41-4eb2-9ba8-8a91407c8b7d",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-01-10T05:08:20.303",
    profit: 0.00076,
    barsHeld: 3
  },
  {
    id: "58da321b-eec8-4db4-8c26-e82cc28ceac6",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-01-10T05:45:31.304",
    profit: 0.03536,
    barsHeld: 8
  },
  {
    id: "09c6732a-08de-434a-9916-501af0444801",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-01-10T05:52:54.372",
    profit: -0.00264,
    barsHeld: 1
  },
  {
    id: "7a7aa472-35be-4ec9-9a0b-e0f9ff0e73fc",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-01-10T06:07:09.402",
    profit: 0.03956,
    barsHeld: 3
  },
  {
    id: "36b61098-9eff-445d-92af-12fa2a5bc6d1",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-01-10T06:12:28.446",
    profit: -0.019081,
    barsHeld: 1
  },
  {
    id: "c221861e-496c-4487-be8b-aee6b48b0a46",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-01-10T06:26:12.12",
    profit: 0.006319,
    barsHeld: 3
  },
  {
    id: "166caef9-06b8-4110-a873-d3b71dcd92c4",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-01-10T06:40:18.328",
    profit: 0.04956,
    barsHeld: 3
  },
  {
    id: "18a91986-2881-4a1d-8127-363c8604dcc3",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-01-10T06:54:14.877",
    profit: -0.00304,
    barsHeld: 2
  },
  {
    id: "4947e8d5-40c2-49eb-bd7e-e2efb11c73ab",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-01-10T07:03:53.09",
    profit: -0.04244,
    barsHeld: 2
  },
  {
    id: "d19be2e5-8df5-4cb5-bc20-7b0acd46e15d",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-01-10T07:29:07.095",
    profit: -0.00744,
    barsHeld: 5
  },
  {
    id: "a9d98b55-c49f-4978-896a-ea6c33ce2b01",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-01-10T07:46:54.135",
    profit: -0.01304,
    barsHeld: 4
  },
  {
    id: "44b9cb89-3034-43c7-bffb-52caa2887d8d",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-01-10T07:59:38.862",
    profit: -0.02024,
    barsHeld: 2
  },
  {
    id: "5f195cc2-7c79-4d48-86dc-21d6d5ab80a0",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-01-10T08:08:43.07",
    profit: -0.03864,
    barsHeld: 2
  },
  {
    id: "ab6c7d27-e547-48ba-9639-c07d8f862878",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-01-10T08:31:13.627",
    profit: 0.00736,
    barsHeld: 5
  },
  {
    id: "32900a2b-c925-41b8-a604-0a64d58b9be3",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-01-10T08:46:21.891",
    profit: -0.03344,
    barsHeld: 3
  },
  {
    id: "9acbbc3d-c196-49b7-9b60-8cd6530a2ee6",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-01-10T08:52:28.922",
    profit: -0.01544,
    barsHeld: 1
  },
  {
    id: "03a003bb-9fc6-4b97-a036-b187a6c7ec73",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-01-10T09:40:19.629",
    profit: 0.04936,
    barsHeld: 10
  },
  {
    id: "cff695df-307c-48e5-9297-335181205501",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-01-10T10:04:37.316",
    profit: 0.00536,
    barsHeld: 4
  },
  {
    id: "74d98357-76b9-457c-9104-63b409c2a5d3",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-01-10T10:14:23.136",
    profit: -0.00564,
    barsHeld: 2
  },
  {
    id: "e61d3a48-4cb2-4907-a1f4-79970d3c8d52",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-01-10T10:23:13.427",
    profit: -0.02624,
    barsHeld: 2
  },
  {
    id: "12362985-0c5c-4ecd-8b78-00a0091b813f",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-01-10T11:40:53.509",
    profit: 0.16056,
    barsHeld: 16
  },
  {
    id: "3d3e5243-0925-4a4f-b03e-3913188498be",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-01-10T12:00:04.044",
    profit: -0.01604,
    barsHeld: 4
  },
  {
    id: "f65d4e37-39e5-4586-a619-0475b7ed9ad4",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-01-10T12:20:37.17",
    profit: 0.00956,
    barsHeld: 4
  },
  {
    id: "ee81253c-96b3-4099-99d0-bdd45fec7013",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-01-10T12:33:25.348",
    profit: -0.029358,
    barsHeld: 2
  },
  {
    id: "fadb9dea-ed59-46bc-bdb1-caaca242dd40",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-01-10T13:09:17.456",
    profit: 0.057242,
    barsHeld: 7
  },
  {
    id: "7e29d82f-6096-4f6e-9a44-01ff641180ea",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-01-10T13:23:08.256",
    profit: -0.00504,
    barsHeld: 3
  },
  {
    id: "127dc4d7-4f5b-4b73-8ad0-3787702686db",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-01-10T13:45:49.49",
    profit: 0.06176,
    barsHeld: 5
  },
  {
    id: "0ee30c70-fc8a-4c75-8b93-bf245e0ec7f9",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-01-10T14:15:33.365",
    profit: 0.03836,
    barsHeld: 6
  },
  {
    id: "8c0fdd4f-1bd6-49ee-9f1b-eb826c03b23f",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-01-10T15:05:27.904",
    profit: 0.11376,
    barsHeld: 10
  },
  {
    id: "6b6d8818-7664-43cb-80aa-63e84c353d33",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-01-10T15:10:21.144",
    profit: -0.04684,
    barsHeld: 1
  },
  {
    id: "d3d2a995-2d35-439c-bc66-3ab01e3d319a",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-01-10T15:26:41.75",
    profit: 0.12176,
    barsHeld: 3
  },
  {
    id: "10719e67-f586-44be-abee-63954e366261",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-01-10T15:32:41.455",
    profit: -0.03024,
    barsHeld: 1
  },
  {
    id: "5ddf3fe7-5296-4080-b164-e05023cd2970",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-01-10T15:50:18.12",
    profit: -0.01764,
    barsHeld: 4
  },
  {
    id: "87bd1720-0d78-47fe-91df-62cc363e8272",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-01-10T16:01:14.129",
    profit: -0.04184,
    barsHeld: 2
  },
  {
    id: "267a032f-0129-44c1-ab84-173d2d33c164",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-01-10T16:09:40.448",
    profit: -0.01984,
    barsHeld: 1
  },
  {
    id: "ba202b0d-2d55-4823-858d-625ddde63fda",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-01-10T16:15:13.806",
    profit: 0.00736,
    barsHeld: 2
  },
  {
    id: "01736685-936d-4d64-81d8-2deedc3be33a",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-01-10T16:20:20.349",
    profit: -0.09724,
    barsHeld: 1
  },
  {
    id: "940e8758-51af-4cf6-b972-f853405983e7",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-01-10T16:31:02.567",
    profit: -0.02744,
    barsHeld: 2
  },
  {
    id: "06c9db21-8c0f-4c1a-9d08-0e66d5165437",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-01-10T16:43:58.951",
    profit: -0.02744,
    barsHeld: 2
  },
  {
    id: "3bdb641e-2b71-4c4e-9e2c-061e80fe793f",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-01-10T17:31:59.462",
    profit: 0.13876,
    barsHeld: 10
  },
  {
    id: "294245f2-6dc5-45f0-b9a2-52a633fe996b",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-01-10T17:41:58.21",
    profit: -0.01984,
    barsHeld: 2
  },
  {
    id: "de2fcda6-6068-4cae-8aa1-7d0ce0cbd6ef",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-01-10T17:55:43.12",
    profit: -0.02284,
    barsHeld: 3
  },
  {
    id: "b866fa22-417f-4d99-a1b6-45796f9b6df1",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-01-13T13:54:27.677",
    profit: 0.30236,
    barsHeld: 815
  },
  {
    id: "349c0b10-aece-4101-9416-f251cfe68888",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-01-13T16:41:50.061",
    profit: 0.00476,
    barsHeld: 34
  },
  {
    id: "c5e2279a-b555-4daa-97eb-577a503f1b02",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-01-14T03:29:06.108",
    profit: 0.59096,
    barsHeld: 129
  },
  {
    id: "4c0947f4-b159-4341-a0e6-5d7237b49eef",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-01-14T03:36:01.375",
    profit: -0.02944,
    barsHeld: 2
  },
  {
    id: "21929b7c-9592-4d5d-95f2-140df40c1435",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-01-14T04:39:13.156",
    profit: 0.252768,
    barsHeld: 12
  },
  {
    id: "07f15ed6-8861-4b76-9201-dbd4a9a15efd",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-01-14T04:44:47.904",
    profit: -0.030432,
    barsHeld: 1
  },
  {
    id: "ae91e3e6-2fc0-4dae-9140-f54ce21f7e55",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-01-14T05:06:41.149",
    profit: -0.052983,
    barsHeld: 5
  },
  {
    id: "fb5ad7c8-e26d-4322-a8aa-af9f6dde1cf2",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-01-14T05:10:31.353",
    profit: -0.011583,
    barsHeld: 1
  },
  {
    id: "39136fd5-a365-4b97-86d8-eceaab90eb80",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-01-14T13:33:36.551",
    profit: 0.01436,
    barsHeld: 100
  },
  {
    id: "f96112cf-c0ad-4f0e-899a-3e7ca16f03b5",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-01-14T13:45:41.567",
    profit: -0.01464,
    barsHeld: 3
  },
  {
    id: "634c30f4-3903-4836-9ac7-cbc65d71534d",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-01-14T14:36:52.188",
    profit: 0.23876,
    barsHeld: 10
  },
  {
    id: "01ea4fb9-e7ef-4a3a-be10-430a8c16cfde",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-01-14T14:45:42.056",
    profit: -0.08464,
    barsHeld: 2
  },
  {
    id: "37af7000-952c-4fd9-9cdc-6382eac132c4",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-01-14T14:50:50.221",
    profit: -0.01984,
    barsHeld: 1
  },
  {
    id: "ef08f147-0856-4799-aa20-27f7164044cd",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-01-14T14:55:02.248",
    profit: -0.03444,
    barsHeld: 1
  },
  {
    id: "3c6d791a-e2b1-4624-8046-f9615aeb00b0",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-01-14T15:01:15.223",
    profit: -0.06424,
    barsHeld: 1
  },
  {
    id: "eeaf54dd-ef6b-4c96-9181-011ac1372922",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-01-14T15:10:42.088",
    profit: 0.03156,
    barsHeld: 2
  },
  {
    id: "3186e1d4-7872-4cdf-9888-1b7af6e997a0",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-01-14T15:38:06.309",
    profit: 0.04496,
    barsHeld: 5
  },
  {
    id: "23342e06-76a6-4a81-a66e-bd57dd9ae252",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-01-14T15:50:50.433",
    profit: -0.03804,
    barsHeld: 3
  },
  {
    id: "be545223-62b0-45ff-aebc-1268d0b0cddd",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-01-14T15:59:55.162",
    profit: -0.03284,
    barsHeld: 1
  },
  {
    id: "d39f7507-379d-4d5a-9ed9-00de25bf0f7d",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-01-14T16:10:31.907",
    profit: 0.15256,
    barsHeld: 3
  },
  {
    id: "d665698a-f528-45c3-813f-2899e97097cc",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-01-14T16:15:23.688",
    profit: -0.06824,
    barsHeld: 1
  },
  {
    id: "5cb3196d-3e23-4c55-8e78-1478d2912bbb",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-01-14T16:32:53.937",
    profit: 0.00916,
    barsHeld: 3
  },
  {
    id: "b166d25a-36d6-4e01-9952-b186d9af3d25",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-01-14T17:16:50.53",
    profit: 0.249993,
    barsHeld: 9
  },
  {
    id: "c69faf90-a239-41ee-b332-e9181fc3197a",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-01-14T17:40:29.121",
    profit: -0.023227,
    barsHeld: 5
  },
  {
    id: "5693dab4-3c80-4200-84d2-e3092d73f105",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-01-14T18:23:40.023",
    profit: 0.10014,
    barsHeld: 8
  },
  {
    id: "1038f9fd-bac7-4d4e-b89f-62fcabc165e0",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-01-14T18:56:08.632",
    profit: 0.07856,
    barsHeld: 7
  },
  {
    id: "91cd8542-c4d1-4721-9fda-a80f4037e8d4",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-01-14T19:13:10.139",
    profit: -0.040229,
    barsHeld: 3
  },
  {
    id: "851f10dc-e13d-4fab-a7ac-feeea84c3562",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-01-14T19:35:24.539",
    profit: -0.052829,
    barsHeld: 5
  },
  {
    id: "af1bf126-d1e2-4b0d-8b24-5f9a4097c4fe",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-01-14T20:14:06.321",
    profit: -0.01424,
    barsHeld: 7
  },
  {
    id: "e16a0a9e-7c72-473d-b407-7cb00fe05c0c",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-01-14T20:38:53.368",
    profit: 0.01376,
    barsHeld: 5
  },
  {
    id: "c835e36f-4dc2-4135-b78d-f777a785c5b2",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-01-14T20:47:26.095",
    profit: -0.03004,
    barsHeld: 2
  },
  {
    id: "4ca15937-eacf-4544-ba9f-fe137c4e7905",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-01-14T21:10:02.591",
    profit: 0.01656,
    barsHeld: 5
  },
  {
    id: "5082873a-0026-4db9-a11b-918ad5fe2ec6",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-01-15T04:29:45.908",
    profit: 0.01556,
    barsHeld: 87
  },
  {
    id: "71e2098a-b8a1-41b9-9be8-e234c6bd9044",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-01-15T04:31:40.19",
    profit: 0.15416,
    barsHeld: 1
  },
  {
    id: "9f300e87-81a4-46cb-9b29-a7835e51757f",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-01-15T04:46:45.348",
    profit: 0.03056,
    barsHeld: 3
  },
  {
    id: "a35e78f1-2946-4c8d-9522-641870ca9a84",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-01-15T05:21:10.126",
    profit: 0.03576,
    barsHeld: 7
  },
  {
    id: "e6315a09-f5bf-42e1-8477-6f4e8296c6f3",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-01-15T05:44:23.199",
    profit: 0.04376,
    barsHeld: 4
  },
  {
    id: "be062f75-2153-4c87-bf06-78988bfe237a",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-01-15T06:06:35.206",
    profit: 0.04956,
    barsHeld: 5
  },
  {
    id: "9de62657-2cd3-4397-ae5b-57d9100832e9",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-01-15T06:57:10.267",
    profit: 0.09956,
    barsHeld: 10
  },
  {
    id: "c6e6285a-7990-4a42-96e4-f41f50e7587e",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-01-15T07:45:12.497",
    profit: 0.09576,
    barsHeld: 10
  },
  {
    id: "3594cd3f-450b-4659-b285-9900ce87de56",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-01-15T07:55:43.653",
    profit: -0.00024,
    barsHeld: 2
  },
  {
    id: "3529793c-2634-467a-a6a3-0962c3035a36",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-01-15T08:10:05.715",
    profit: 0.00676,
    barsHeld: 3
  },
  {
    id: "61021954-71f5-4bc2-8077-d0cfcb0df65e",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-01-15T08:47:19.222",
    profit: 0.04736,
    barsHeld: 7
  },
  {
    id: "196a0883-4cb5-485e-b04e-e12bdce87d4e",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-01-15T09:18:14.279",
    profit: -0.01024,
    barsHeld: 6
  },
  {
    id: "c257bce8-6a53-4497-9175-38a98e8836e4",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-01-15T09:23:39.995",
    profit: -0.02804,
    barsHeld: 1
  },
  {
    id: "710d05f2-e1ae-4aea-886e-f0d66dd7c22c",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-01-15T09:36:53.316",
    profit: -0.03624,
    barsHeld: 3
  },
  {
    id: "0d66c6d0-ad99-4f72-b0c5-7e79d1ca3920",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-01-15T10:08:39.23",
    profit: 0.17456,
    barsHeld: 6
  },
  {
    id: "22f8ee12-4a05-4744-8c02-8fe60f9a28a0",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-01-15T10:25:20.243",
    profit: 0.030787,
    barsHeld: 4
  },
  {
    id: "c183438e-38e4-40fa-b8c8-5ae50e6bac8c",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-01-15T10:41:37.305",
    profit: 0.046787,
    barsHeld: 3
  },
  {
    id: "2955e3f9-b1d6-4aca-81fc-db74593e373d",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-01-15T10:45:56.881",
    profit: -0.03424,
    barsHeld: 1
  },
  {
    id: "34cad61e-f812-43c1-9456-1f6994f27afd",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-01-15T11:04:37.816",
    profit: 0.00916,
    barsHeld: 3
  },
  {
    id: "e28c1b61-8b02-4c41-af2f-90890705f4fd",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-01-15T11:16:39.605",
    profit: 0.00176,
    barsHeld: 3
  },
  {
    id: "8b2cdce4-73ed-48bc-b5be-427e2ece2753",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-01-15T11:34:38.148",
    profit: 0.00496,
    barsHeld: 3
  },
  {
    id: "53d7a077-8ef8-44df-87d5-bf04a3db6329",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-01-15T11:46:23.359",
    profit: 0.01096,
    barsHeld: 3
  },
  {
    id: "6083d9fc-8d09-4c48-9d06-692f08e8d947",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-01-15T11:50:05.308",
    profit: -0.02384,
    barsHeld: 1
  },
  {
    id: "b2b699ff-88c5-4998-84e0-c2640cc237cd",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-01-15T12:05:28.219",
    profit: 0.048348,
    barsHeld: 3
  },
  {
    id: "68ed5318-a3c1-4071-a94f-141971752c41",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-01-15T12:16:39.731",
    profit: 0.034548,
    barsHeld: 2
  },
  {
    id: "4619753e-ca00-46fe-8206-cab5c36be0e9",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-01-15T12:20:46.432",
    profit: -0.01404,
    barsHeld: 1
  },
  {
    id: "2fe9890f-7c09-47c5-9838-f3f4b92813d9",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-01-15T12:43:18.353",
    profit: 0.022143,
    barsHeld: 4
  },
  {
    id: "5fc15488-6386-4c89-bd20-32d28ec3e516",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-01-15T13:00:38.062",
    profit: 0.012943,
    barsHeld: 4
  },
  {
    id: "ce8dd284-8436-4091-aad3-63872705af5e",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-01-15T14:01:17.284",
    profit: 0.181748,
    barsHeld: 12
  },
  {
    id: "38a7d9c6-88ef-48c2-8950-f881513d4876",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-01-15T14:25:06.365",
    profit: -0.014652,
    barsHeld: 5
  },
  {
    id: "8f4de9e4-3a35-420c-a5d9-eab1b30e25ac",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-01-15T15:03:01.95",
    profit: -0.04724,
    barsHeld: 7
  },
  {
    id: "a7e87e04-4590-46aa-9233-a1aca71e890c",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-01-15T15:50:20.55",
    profit: 0.10656,
    barsHeld: 10
  },
  {
    id: "81a3822b-bb83-4649-a292-5cd24ea54551",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-01-15T16:02:29.194",
    profit: -0.02624,
    barsHeld: 2
  },
  {
    id: "1760024f-ff69-4a78-ab66-69ce979a0676",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-01-15T16:11:15.565",
    profit: 0.00496,
    barsHeld: 2
  },
  {
    id: "13ba4b79-d822-4cba-9ded-76a46c85e8fe",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-01-15T16:22:00.143",
    profit: 0.047843,
    barsHeld: 2
  },
  {
    id: "b43857f0-2224-4abc-bd1a-912fd71ba923",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-01-15T16:32:24.133",
    profit: -0.015757,
    barsHeld: 2
  },
  {
    id: "3fa9967d-1a25-4e35-bd33-57ec56da4155",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-01-15T16:44:08.528",
    profit: 0.00196,
    barsHeld: 2
  },
  {
    id: "d0f67e74-098f-4792-9597-f18700e95d9f",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-01-15T17:12:45.545",
    profit: 0.09576,
    barsHeld: 6
  },
  {
    id: "f5e4d284-69d3-435c-aee4-373b43d34455",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-01-15T17:24:59.658",
    profit: 0.00916,
    barsHeld: 2
  },
  {
    id: "5c226033-5051-41b8-bcf7-8f348fb71b30",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-01-15T17:30:45.181",
    profit: -0.017141,
    barsHeld: 2
  },
  {
    id: "08c491fa-9528-4258-83da-5fb82af65fd4",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-01-15T17:35:08.459",
    profit: -0.009741,
    barsHeld: 1
  },
  {
    id: "44e1cc1a-d715-48f3-8b23-aab0816678d5",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-01-15T17:41:00.594",
    profit: -0.00644,
    barsHeld: 1
  },
  {
    id: "d74e5b04-3f3d-4c6c-8a6a-37615c584538",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-01-15T18:07:00.586",
    profit: 0.02716,
    barsHeld: 5
  },
  {
    id: "223e035a-db42-428e-9b26-4b4c0455e0d5",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-01-15T18:40:19.48",
    profit: 0.07136,
    barsHeld: 7
  },
  {
    id: "02930d1d-6484-4db4-afa3-685d0ecf1861",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-01-15T18:56:32.75",
    profit: 0.03536,
    barsHeld: 3
  },
  {
    id: "531896a7-3ee5-46f1-8640-93b552e8b254",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-01-15T19:08:45.601",
    profit: -0.015257,
    barsHeld: 2
  },
  {
    id: "afac46d8-79d4-4343-849d-e5b6d1540424",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-01-15T19:30:28.25",
    profit: 0.000943,
    barsHeld: 5
  },
  {
    id: "ecf32d50-f268-4b8d-be6b-e4f499a12954",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-01-15T19:56:29.555",
    profit: -0.03144,
    barsHeld: 5
  },
  {
    id: "19e05628-6aa8-4f37-8a77-b71292f23fde",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-01-15T20:18:02.651",
    profit: -0.03664,
    barsHeld: 4
  },
  {
    id: "2bd24560-f70a-44e7-818c-fb3e963de3bf",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-01-15T20:38:13.201",
    profit: -0.00984,
    barsHeld: 4
  },
  {
    id: "43cef40a-145e-426e-8c9e-6faa36f2ba67",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-01-15T21:32:31.358",
    profit: 0.14256,
    barsHeld: 11
  },
  {
    id: "64554aa6-bde2-481d-b509-8d4ea8e72aa4",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-01-15T21:48:04.862",
    profit: 0.06096,
    barsHeld: 3
  },
  {
    id: "3aca2754-870f-4ccf-a4be-e2aa57d8e382",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-01-15T22:05:57.264",
    profit: 0.05336,
    barsHeld: 4
  },
  {
    id: "0ed8fa59-91e7-4807-b083-de047f4c9759",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-01-15T22:17:06.159",
    profit: -0.00024,
    barsHeld: 2
  },
  {
    id: "54c89f98-82b8-487a-ad39-87024a5c065f",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-01-15T22:47:53.68",
    profit: 0.04436,
    barsHeld: 6
  },
  {
    id: "4336ffb9-1122-4a19-9e31-55a8087022fe",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-01-15T22:57:48.344",
    profit: -0.00544,
    barsHeld: 2
  },
  {
    id: "6ba4b129-23b4-40d8-9628-8705faa88c0f",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-01-15T23:06:05.045",
    profit: -0.010523,
    barsHeld: 2
  },
  {
    id: "f65da29f-5bef-478b-b34d-47ae9e354b89",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-01-15T23:26:14.169",
    profit: 0.018277,
    barsHeld: 4
  },
  {
    id: "956f56ad-a3c0-4f14-ad16-7a975a9247e4",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-01-15T23:34:36.134",
    profit: -0.03424,
    barsHeld: 1
  },
  {
    id: "5026905a-1dbb-4ad7-bd30-3bded74f27af",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-01-16T06:51:03.401",
    profit: 0.23696,
    barsHeld: 88
  },
  {
    id: "e640cd14-382d-4421-9af8-3b8d8ea3455b",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-01-16T07:03:13.051",
    profit: -0.00444,
    barsHeld: 2
  },
  {
    id: "0a678c2c-3d89-48de-9070-b17dc3b7cb09",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-01-16T07:59:23.116",
    profit: 0.06836,
    barsHeld: 11
  },
  {
    id: "b0622d15-846a-450e-8373-540b9fc6f1aa",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-01-16T08:04:15.459",
    profit: -0.00024,
    barsHeld: 1
  },
  {
    id: "06a14ecc-9dee-4a93-bbc9-905213fe012b",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-01-16T08:14:59.048",
    profit: -0.00064,
    barsHeld: 2
  },
  {
    id: "4563d873-1d1d-4e19-88cd-f516f7280707",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-01-16T08:50:32.333",
    profit: 0.04616,
    barsHeld: 8
  },
  {
    id: "a39a6cbb-dd2f-48b5-9b65-6f8a414f3ace",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-01-16T09:33:19.633",
    profit: 0.12056,
    barsHeld: 8
  },
  {
    id: "fc3f8b8a-5f76-435c-9dca-7554fe6d790c",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-01-16T09:38:33.433",
    profit: -0.02564,
    barsHeld: 1
  },
  {
    id: "61452e05-8e3a-4ad4-8474-df653e91f970",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-01-16T09:48:05.304",
    profit: -0.00284,
    barsHeld: 2
  },
  {
    id: "ad47786e-0201-44f4-85a8-e697a1676dd3",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-01-16T10:01:38.19",
    profit: 0.05516,
    barsHeld: 3
  },
  {
    id: "b811b212-786e-4128-bfba-4268a8910dc7",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-01-16T10:17:47.429",
    profit: 0.04856,
    barsHeld: 3
  },
  {
    id: "4a0627ac-25f3-411b-bb65-31e4e8747a0c",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-01-16T10:48:24.207",
    profit: 0.029571,
    barsHeld: 6
  },
  {
    id: "df96ceb7-5626-4085-a4c8-80532078086d",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-01-16T11:05:45.378",
    profit: -0.024629,
    barsHeld: 4
  },
  {
    id: "564523c4-7ce5-4657-9d6c-6e6102e4eac0",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-01-16T11:19:22.615",
    profit: -0.02004,
    barsHeld: 2
  },
  {
    id: "51a1b6fd-4ee0-4b4b-9420-47533806982b",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-01-16T11:32:30.057",
    profit: -0.02544,
    barsHeld: 3
  },
  {
    id: "6186a414-3e20-4879-9d07-e1e7983a5544",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-01-16T11:52:38.278",
    profit: 0.07876,
    barsHeld: 4
  },
  {
    id: "d1b17d7f-9756-4f2b-94d7-94f6f811a940",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-01-16T11:58:39.49",
    profit: -0.01864,
    barsHeld: 1
  },
  {
    id: "15220369-45d0-475e-9c14-28dd7ae3f32d",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-01-16T12:31:02.767",
    profit: 0.12756,
    barsHeld: 7
  },
  {
    id: "466b2e76-ae77-419a-8967-1bb1d66907ed",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-01-16T12:41:24.13",
    profit: 0.020068,
    barsHeld: 2
  },
  {
    id: "57761a7d-b06d-4694-a5fc-4beee4ab011f",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-01-16T12:45:03.87",
    profit: -0.016086,
    barsHeld: 1
  },
  {
    id: "ece506fe-722e-4e9d-a9b8-a7295e1ba38e",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-01-16T12:52:09.445",
    profit: -0.00004,
    barsHeld: 1
  },
  {
    id: "f8d08be3-2b83-4721-b198-91c3b3950f73",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-01-16T12:59:06.274",
    profit: -0.014872,
    barsHeld: 1
  },
  {
    id: "9716038b-55a5-47cc-95ff-439a4879dab2",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-01-16T13:42:09.012",
    profit: 0.104173,
    barsHeld: 9
  },
  {
    id: "664dcfba-ce2c-4ca1-8872-070e4924f8e0",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-01-16T13:54:30.126",
    profit: 0.00156,
    barsHeld: 2
  },
  {
    id: "72e0c895-3ed1-489f-91b4-f49c3472c062",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-01-16T14:20:59.353",
    profit: 0.06276,
    barsHeld: 6
  },
  {
    id: "d4eee548-ca25-46f3-9a32-2ce4dddd7ecc",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-01-16T14:48:38.125",
    profit: 0.03796,
    barsHeld: 5
  },
  {
    id: "018dd200-5987-4b3e-88c4-f146db21c587",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-01-16T14:59:07.073",
    profit: 0.01156,
    barsHeld: 2
  },
  {
    id: "6a4d83b8-a259-42dc-a8ed-249e431ccc75",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-01-16T15:15:17.551",
    profit: 0.03236,
    barsHeld: 4
  },
  {
    id: "68a72c95-0019-4a73-9578-5c945d4ffc59",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-01-16T15:44:51.614",
    profit: -0.00664,
    barsHeld: 5
  },
  {
    id: "176f0bf6-bf54-4d97-9c86-564b6d5c2bb0",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-01-16T16:01:36.109",
    profit: 0.000014,
    barsHeld: 4
  },
  {
    id: "daaadf1c-b11e-4efe-9e86-c46fb6ce93c5",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-01-16T16:58:39.596",
    profit: 0.079614,
    barsHeld: 11
  },
  {
    id: "5ce97ede-48f2-434e-a756-24fbe0f779b5",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-01-16T18:02:49.44",
    profit: 0.07316,
    barsHeld: 13
  },
  {
    id: "6b77407f-1113-4289-a6b9-94c88a5a52f9",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-01-16T18:32:17.498",
    profit: 0.02996,
    barsHeld: 6
  },
  {
    id: "11d794e7-e1fb-469e-bcaa-88ab7ba112b9",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-01-16T19:41:37.158",
    profit: 0.08296,
    barsHeld: 14
  },
  {
    id: "0c4387e1-881a-40d1-ae96-1d89e21290ff",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-01-16T20:01:07.509",
    profit: 0.00756,
    barsHeld: 4
  },
  {
    id: "e8891d91-21e8-424c-87cd-7b9b5846ea68",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-01-16T20:15:28.137",
    profit: 0.01016,
    barsHeld: 3
  },
  {
    id: "b7121c66-6fd0-42e3-909d-49c0627e4b73",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-01-16T20:24:47.288",
    profit: -0.02244,
    barsHeld: 1
  },
  {
    id: "7a1de2a1-5b82-4a4a-a580-08683c648776",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-01-16T20:37:32.055",
    profit: 0.00276,
    barsHeld: 3
  },
  {
    id: "f0168acc-bc54-4ad7-b75c-5d942a0c7c96",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-01-16T20:51:42.184",
    profit: -0.000725,
    barsHeld: 3
  },
  {
    id: "f9b531b0-d2cb-453a-86ed-45096ae06a31",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-01-16T21:09:11.632",
    profit: 0.041275,
    barsHeld: 3
  },
  {
    id: "0ab1f2c0-6910-4245-8377-a79e15ff772d",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-01-16T21:35:19.299",
    profit: 0.10256,
    barsHeld: 6
  },
  {
    id: "9bf25014-e839-4eed-9b57-7c9430bb63a7",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-01-16T21:56:08.326",
    profit: 0.00056,
    barsHeld: 4
  },
  {
    id: "d280bfcc-4453-49ed-9eea-0dd89120896d",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-01-16T22:11:27.13",
    profit: -0.023466,
    barsHeld: 3
  },
  {
    id: "4db06345-8e52-4bd9-b0a3-7c44baec662e",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-01-16T23:23:43.128",
    profit: 0.067534,
    barsHeld: 14
  },
  {
    id: "c5485117-a22f-4ad2-884f-abf513153220",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-01-16T23:47:22.283",
    profit: 0.01596,
    barsHeld: 5
  },
  {
    id: "5f1e1157-8c60-4840-a578-e926ad7d427f",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-01-20T08:06:14.865",
    profit: 0.23536,
    barsHeld: 964
  },
  {
    id: "469d5d4d-5143-4cc9-8da4-766ec938aba5",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-01-20T08:55:04.242",
    profit: 0.39976,
    barsHeld: 10
  },
  {
    id: "e2563270-8f82-4af6-8eb3-cec5e5583707",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-01-20T09:20:35.17",
    profit: 0.04476,
    barsHeld: 5
  },
  {
    id: "62531789-6cf5-4661-a95d-9c6dde7f5652",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-01-20T10:00:25.655",
    profit: 0.019917,
    barsHeld: 8
  },
  {
    id: "94ee2470-cd70-4ce0-8bda-3fde8491726f",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-01-20T10:17:47.854",
    profit: -0.000482,
    barsHeld: 3
  },
  {
    id: "1bdf38aa-1614-4637-9c94-3a24e563f904",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-01-20T10:41:49.386",
    profit: 0.008161,
    barsHeld: 5
  },
  {
    id: "5757f0e3-cd38-49b8-afe7-fdcf541a6e25",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-01-20T11:24:37.337",
    profit: 0.00956,
    barsHeld: 8
  },
  {
    id: "fdc26ee0-a2d8-41b3-9635-73e1c3481290",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-01-20T12:13:33.37",
    profit: 0.061077,
    barsHeld: 10
  },
  {
    id: "99557a70-7679-474e-8637-c465f0cc6c0d",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-01-20T12:17:56.4",
    profit: -0.006286,
    barsHeld: 1
  },
  {
    id: "1845d5d0-a2da-47fe-a506-fb65a85c327e",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-01-20T12:42:17.991",
    profit: 0.077539,
    barsHeld: 5
  },
  {
    id: "bd42206c-6c32-4356-abef-dafd9c737190",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-01-20T12:51:44.53",
    profit: 0.010502,
    barsHeld: 2
  },
  {
    id: "84be9ec0-4ee4-4d4b-af20-ee2c03214579",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-01-20T13:20:11.39",
    profit: 0.10096,
    barsHeld: 6
  },
  {
    id: "8315217f-945f-4e7a-93f2-ce69b9730469",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-01-20T13:39:11.301",
    profit: 0.04856,
    barsHeld: 3
  },
  {
    id: "ec5c6e21-8f35-471c-8b58-80b4d1d6e15c",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-01-20T13:45:20.395",
    profit: -0.05144,
    barsHeld: 2
  },
  {
    id: "69c37be5-826d-4708-b6be-0476025707ef",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-01-20T13:56:16.58",
    profit: 0.06756,
    barsHeld: 2
  },
  {
    id: "3a61e6e1-7310-42d5-b8c5-abaccf5292e0",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-01-20T14:22:15.079",
    profit: -0.00024,
    barsHeld: 5
  },
  {
    id: "296bb561-220e-4b03-b884-4d30fe4083b3",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-01-20T15:05:37.219",
    profit: 0.05936,
    barsHeld: 9
  },
  {
    id: "4bc6e317-2fe8-433c-b6c4-d1d580928da1",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-01-20T15:51:46.689",
    profit: -0.012311,
    barsHeld: 9
  },
  {
    id: "8eb959ed-c7e4-4ade-aa9d-9e3b38457c12",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-01-20T16:12:59.314",
    profit: 0.028689,
    barsHeld: 4
  },
  {
    id: "f8bf83e4-f110-4d1c-bd10-043fe77a2a11",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-01-20T17:45:27.597",
    profit: 0.02236,
    barsHeld: 19
  },
  {
    id: "80ea03b0-a630-4f30-8bb1-655bf7547a2a",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-01-20T17:53:56.177",
    profit: -0.02424,
    barsHeld: 1
  },
  {
    id: "bd142cc3-f965-4f10-be47-1c0581c7e626",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-01-20T18:05:37.829",
    profit: -0.00704,
    barsHeld: 3
  },
  {
    id: "f7c9acdc-71e4-41f5-8957-8080dba29190",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-01-20T18:39:34.512",
    profit: 0.02796,
    barsHeld: 6
  },
  {
    id: "749908f3-4670-48ba-a4bf-22d19aa58474",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-01-20T18:48:33.154",
    profit: -0.01164,
    barsHeld: 2
  },
  {
    id: "40cc0af1-7ff3-4fea-9f79-009df79f5433",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-01-20T18:59:53.534",
    profit: -0.01724,
    barsHeld: 2
  },
  {
    id: "38b3b7e0-2428-4077-bd67-4e626d8f3b13",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-01-20T19:16:31.402",
    profit: -0.00104,
    barsHeld: 4
  },
  {
    id: "b7e48d9a-c657-459c-af95-be333e67e6e2",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-01-20T19:29:04.189",
    profit: -0.003246,
    barsHeld: 2
  },
  {
    id: "98d87116-a58e-4bd3-8a39-69d07a4430a0",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-01-20T19:34:37.285",
    profit: -0.015701,
    barsHeld: 1
  },
  {
    id: "405fe469-bff9-4856-932d-6c00730a7779",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-01-20T20:10:15.368",
    profit: 0.000705,
    barsHeld: 8
  },
  {
    id: "27b82bf6-b556-4a64-82c2-c9f6d7108c85",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-01-20T20:56:36.55",
    profit: 0.00556,
    barsHeld: 9
  },
  {
    id: "0d349f25-8a0f-47b5-85d3-aad0ca3d9ed0",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-01-20T22:25:44.066",
    profit: 0.09756,
    barsHeld: 18
  },
  {
    id: "2c768949-3046-49d8-892f-2e21a73d4a4e",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-01-20T22:30:20.203",
    profit: -0.00044,
    barsHeld: 1
  },
  {
    id: "4c3b2e2a-d3d7-40f4-81e9-b06ad0e443b6",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-01-20T22:49:29.306",
    profit: 0.03216,
    barsHeld: 3
  },
  {
    id: "9f76a275-c88f-4a11-86d6-c59576167030",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-01-20T23:07:39.051",
    profit: 0.14776,
    barsHeld: 4
  },
  {
    id: "aff6eb83-7d4a-4d5a-9676-c48f051aca66",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-01-20T23:16:16.104",
    profit: -0.01004,
    barsHeld: 2
  },
  {
    id: "e6b12af4-58d0-4a6e-be73-4ffec00ab695",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-01-20T23:21:57.202",
    profit: -0.00124,
    barsHeld: 1
  },
  {
    id: "269fc463-48b4-4da2-87d5-c7dbc6e32309",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-01-20T23:31:53.333",
    profit: 0.03796,
    barsHeld: 2
  },
  {
    id: "7b7e9ed7-6aee-4727-a5ae-382db68101a1",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-01-21T00:00:12.224",
    profit: 0.047075,
    barsHeld: 6
  },
  {
    id: "026f766d-9dca-401a-80f1-238f1e3c074e",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-01-21T00:05:34.337",
    profit: -0.008725,
    barsHeld: 1
  },
  {
    id: "e5ca526d-5cc1-4e73-8163-e9e7717f574f",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-01-21T00:11:02.294",
    profit: -0.00564,
    barsHeld: 1
  },
  {
    id: "9aca96a0-9403-4b89-b562-b0e2f8ae7335",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-01-21T00:17:20.152",
    profit: -0.04044,
    barsHeld: 1
  },
  {
    id: "1c50450e-9a02-44b7-9d55-ad1b11b49171",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-01-21T00:21:25.742",
    profit: -0.01164,
    barsHeld: 1
  },
  {
    id: "709527cc-f0be-4069-90b4-270d69ece807",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-01-21T00:38:39.255",
    profit: 0.02256,
    barsHeld: 3
  },
  {
    id: "53c743b8-6bb9-4e26-9b73-23076ae27c38",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-01-21T01:02:35.764",
    profit: 0.01736,
    barsHeld: 5
  },
  {
    id: "6445d9a8-3be0-4a90-90c0-d352742558fb",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-01-21T01:49:13.265",
    profit: 0.035115,
    barsHeld: 9
  },
  {
    id: "bf90b897-32e1-44dc-ae57-75677de5815a",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-01-21T02:11:42.093",
    profit: -0.006885,
    barsHeld: 5
  },
  {
    id: "a4ff4206-215b-4d0d-8a5f-cfebe1f81c70",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-01-21T02:26:42.547",
    profit: 0.01276,
    barsHeld: 3
  },
  {
    id: "15b32291-8be0-4fc7-b532-cfea679e1031",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-01-21T02:55:55.148",
    profit: 0.006392,
    barsHeld: 6
  },
  {
    id: "4894e5c0-3d76-4cc6-a2bb-d0d2459a0e9f",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-01-21T03:24:58.249",
    profit: 0.014309,
    barsHeld: 5
  },
  {
    id: "24bda026-2f58-4fd3-b239-1c76cbec2d58",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-01-21T03:58:33.365",
    profit: 0.000477,
    barsHeld: 7
  },
  {
    id: "cfb95318-4dfa-47e9-bb99-438790949a5d",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-01-21T04:16:49.421",
    profit: 0.01236,
    barsHeld: 4
  },
  {
    id: "c5acbb87-966f-468b-9cab-7dc20a9ca10f",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-01-21T04:22:14.35",
    profit: -0.00344,
    barsHeld: 1
  },
  {
    id: "b1b17a67-e357-4831-a0ed-de44fefddd11",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-01-21T04:26:48.188",
    profit: -0.00004,
    barsHeld: 1
  },
  {
    id: "8f10cd0a-4c4d-43c2-8839-5d88647bddbd",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-01-21T04:30:06.331",
    profit: -0.00464,
    barsHeld: 1
  },
  {
    id: "b2f3c97d-08f2-459a-873d-13449eed5d94",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-01-21T04:45:09.523",
    profit: 0.01776,
    barsHeld: 3
  },
  {
    id: "de631535-bb1d-47e6-9327-6a13895e70e2",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-01-21T05:07:50.176",
    profit: 0.01756,
    barsHeld: 4
  },
  {
    id: "20d63a2c-44d9-468b-a793-e124dfc5e9c2",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-01-21T05:18:21.603",
    profit: -0.00564,
    barsHeld: 2
  },
  {
    id: "11ed5e7f-f9e4-4a9d-9046-137ed00ed922",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-01-21T05:51:34.586",
    profit: 0.044704,
    barsHeld: 7
  },
  {
    id: "588d7a96-6033-4422-a0d4-515f48230c3f",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-01-21T06:10:17.232",
    profit: 0.014704,
    barsHeld: 4
  },
  {
    id: "72150ed5-517f-4bd3-9e08-2150c28ce669",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-01-21T06:30:31.305",
    profit: 0.02216,
    barsHeld: 4
  },
  {
    id: "b3be30f1-8c6c-43dc-9c51-193a5be2320d",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-01-21T06:44:08.299",
    profit: -0.01264,
    barsHeld: 2
  },
  {
    id: "b4634c50-278d-4cb2-85a8-a33bd1034c8f",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-01-21T06:50:53.504",
    profit: 0.00376,
    barsHeld: 2
  },
  {
    id: "89c37555-d41b-40e7-994a-79eff95315ea",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-01-21T07:23:08.141",
    profit: 0.01716,
    barsHeld: 6
  },
  {
    id: "0bd6da45-9722-4c6f-b477-716713b86013",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-01-21T07:46:46.648",
    profit: 0.05096,
    barsHeld: 5
  },
  {
    id: "95c61aa1-e672-4de4-a475-24c616fa60a2",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-01-21T08:09:32.947",
    profit: 0.00943,
    barsHeld: 4
  },
  {
    id: "b7f31679-5243-402f-846c-b0895a844ff4",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-01-21T08:28:16.598",
    profit: 0.01143,
    barsHeld: 4
  },
  {
    id: "e383a9ab-a3ce-48e1-ab97-50a97f36143f",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-01-21T08:35:03.517",
    profit: -0.01404,
    barsHeld: 2
  },
  {
    id: "6b03c3ee-0f08-4bb1-88f4-049e3a476d66",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-01-21T08:41:31.188",
    profit: -0.01604,
    barsHeld: 1
  },
  {
    id: "4bec8de6-5fea-4561-835a-c98b8d3546d9",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-01-21T09:06:24.731",
    profit: 0.07096,
    barsHeld: 5
  },
  {
    id: "a1582bde-4d89-4c19-a91f-b24c7c3244fa",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-01-21T09:17:40.338",
    profit: 0.01176,
    barsHeld: 2
  },
  {
    id: "24dda6c2-204f-4007-9ab6-9ab0ab495dfb",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-01-21T09:27:26.534",
    profit: -0.00224,
    barsHeld: 2
  },
  {
    id: "44c0405c-872d-4387-8846-05123633a9c3",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-01-21T10:37:31.131",
    profit: 0.039103,
    barsHeld: 14
  },
  {
    id: "42b7d9a7-28ab-41ad-abb3-3d02b7fc4d0c",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-01-21T11:38:11.522",
    profit: 0.053303,
    barsHeld: 12
  },
  {
    id: "c7c669a6-36fc-4df9-8346-45e16b0549d9",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-01-21T12:20:31.402",
    profit: 0.01756,
    barsHeld: 9
  },
  {
    id: "3237bafd-11b0-4b18-9af6-f49827f5ae20",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-01-21T12:38:44.414",
    profit: -0.00384,
    barsHeld: 3
  },
  {
    id: "fcd56f0f-0774-4a40-b4c7-2bf593294e87",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-01-21T12:51:23.431",
    profit: -0.00584,
    barsHeld: 3
  },
  {
    id: "5a53abc1-2bbc-437e-9a01-019518088ed2",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-01-21T13:11:15.283",
    profit: 0.00516,
    barsHeld: 4
  },
  {
    id: "adf26849-72df-4141-96bb-6e3ee7b5e19c",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-01-21T13:37:04.153",
    profit: -0.00504,
    barsHeld: 5
  },
  {
    id: "423c9a1a-0308-49e7-9282-98cf7ab2591f",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-01-21T14:07:58.866",
    profit: 0.01356,
    barsHeld: 6
  },
  {
    id: "75b0c2c5-a039-44f5-9064-5590ee340f47",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-01-21T14:55:54.536",
    profit: 0.02176,
    barsHeld: 10
  },
  {
    id: "a44618f2-7637-4283-865e-3d1b5fc44280",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-01-21T15:57:07.079",
    profit: 0.02796,
    barsHeld: 12
  },
  {
    id: "5cc0f502-40a8-4146-bc66-fb9ae0443ecf",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-01-21T16:22:45.028",
    profit: 0.03156,
    barsHeld: 5
  },
  {
    id: "944e6fad-5245-49cc-bcc8-d96e2c9150f6",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-01-21T16:26:47.309",
    profit: -0.00284,
    barsHeld: 1
  },
  {
    id: "51842da6-66d8-4687-9c99-3f07ffbfb499",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-01-21T16:30:24.752",
    profit: -0.00344,
    barsHeld: 1
  },
  {
    id: "34c75dd8-dbec-438e-82c5-c071759f5303",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-01-21T16:35:07.298",
    profit: -0.04564,
    barsHeld: 1
  },
  {
    id: "fb91325e-7b9c-4af8-b53d-34565c0843a5",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-01-21T16:48:12.551",
    profit: -0.02844,
    barsHeld: 2
  },
  {
    id: "3a1f7fe9-73f0-43df-bf5d-f2769757873a",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-01-21T16:55:47.476",
    profit: 0.00316,
    barsHeld: 2
  },
  {
    id: "8f9fadef-c5d1-4e69-a6d6-49e4b46b2b68",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-01-21T17:10:37.382",
    profit: 0.01096,
    barsHeld: 3
  },
  {
    id: "3435791b-ff76-4b0b-9fc8-903fdd28a872",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-01-21T17:29:19.186",
    profit: 0.00936,
    barsHeld: 3
  },
  {
    id: "af1c0cc2-dfde-4c0d-b957-141a5f8941ed",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-01-21T17:41:53.423",
    profit: 0.004624,
    barsHeld: 3
  },
  {
    id: "390ff865-97ed-4570-bc91-57cc53ba556a",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-01-21T18:10:15.468",
    profit: 0.014224,
    barsHeld: 6
  },
  {
    id: "d8de7570-9088-43cb-a468-0e9dd0a11419",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-01-21T18:44:13.571",
    profit: 0.030682,
    barsHeld: 6
  },
  {
    id: "a080dd31-8545-4024-b4cc-577a3d20e7e5",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-01-21T18:55:20.558",
    profit: -0.013118,
    barsHeld: 3
  },
  {
    id: "a6bb6271-c85a-4d42-bfd4-dc0a7f8296e0",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-01-21T19:00:08.074",
    profit: -0.01544,
    barsHeld: 1
  },
  {
    id: "89990b48-9a8e-4b22-9f04-74ccd91077f9",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-01-21T19:28:40.812",
    profit: 0.00896,
    barsHeld: 5
  },
  {
    id: "32d33b57-0a80-457a-b298-448014069d76",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-01-21T19:55:10.569",
    profit: 0.18816,
    barsHeld: 6
  },
  {
    id: "b967d111-e626-4831-8d4d-58afa85adbe8",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-01-21T20:32:32.071",
    profit: 0.31436,
    barsHeld: 7
  },
  {
    id: "54380c30-1e58-4506-bade-be68f08390b4",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-01-21T20:42:53.116",
    profit: 0.007654,
    barsHeld: 2
  },
  {
    id: "b5e02bba-45d5-4004-949e-9a4c73c73e73",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-01-21T20:51:58.935",
    profit: 0.007454,
    barsHeld: 2
  },
  {
    id: "24cbd484-d599-43b6-b058-54d09321ca7c",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-01-21T20:55:28.142",
    profit: -0.0008,
    barsHeld: 1
  },
  {
    id: "d185dba7-6fd7-4e0d-99e0-c42a99fbb011",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-01-21T21:10:43.759",
    profit: 0.1128,
    barsHeld: 3
  },
  {
    id: "e6a98ae1-c08d-43b6-87e6-dea87ba5bafb",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-01-21T21:28:10.754",
    profit: 0.01336,
    barsHeld: 3
  },
  {
    id: "62d6321e-c69c-4a88-a363-0e15a8ed3285",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-01-21T21:35:56.807",
    profit: -0.00004,
    barsHeld: 2
  },
  {
    id: "e22d16f9-4b96-4c42-ab00-4be17f93c202",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-01-21T21:45:21.053",
    profit: 0.01076,
    barsHeld: 2
  },
  {
    id: "2c86ea20-04bd-40ed-87c4-2f61fabf3406",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-01-21T21:57:46.329",
    profit: -0.005252,
    barsHeld: 2
  },
  {
    id: "5f465162-def3-439f-a1aa-52a3922e4cd7",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-01-21T22:30:06.581",
    profit: 0.052948,
    barsHeld: 7
  },
  {
    id: "4fefc038-a50b-4088-92a5-561dca894280",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-01-21T23:32:24.354",
    profit: 0.05536,
    barsHeld: 12
  },
  {
    id: "548dfd2f-013b-41bb-adbc-bbce0f42a00c",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-01-21T23:50:53.256",
    profit: -0.00604,
    barsHeld: 4
  },
  {
    id: "fca401fc-243c-4d89-8608-31aca2fe8987",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-01-22T00:17:14.082",
    profit: -0.01184,
    barsHeld: 5
  },
  {
    id: "f878feb6-c078-4908-ac73-562c3a470db4",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-01-22T02:22:02.195",
    profit: 0.03536,
    barsHeld: 25
  },
  {
    id: "2176579a-0532-4860-b0b7-764c8a36919d",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-01-22T02:26:38.354",
    profit: -0.01184,
    barsHeld: 1
  },
  {
    id: "689af55c-cc8a-4fd9-b256-4ef8d92fcb54",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-01-22T02:58:10.665",
    profit: 0.01476,
    barsHeld: 6
  },
  {
    id: "3eab1fa5-cda8-428f-9be8-eb944ef32ee0",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-01-22T03:08:35.399",
    profit: -0.00064,
    barsHeld: 2
  },
  {
    id: "f69b9f30-92fd-44b7-94cc-a02c8fe7b6aa",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-01-22T03:15:12.182",
    profit: -0.00264,
    barsHeld: 2
  },
  {
    id: "7c3f1374-296d-42d9-b277-d52e2663091c",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-01-22T03:22:59.474",
    profit: -0.000178,
    barsHeld: 1
  },
  {
    id: "1902ef1d-78b2-494f-8ff6-59a2e0a814ed",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-01-22T03:31:01.541",
    profit: 0.000022,
    barsHeld: 2
  },
  {
    id: "c2006598-2187-4561-a14b-a32e6815819c",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-01-22T03:50:35.096",
    profit: 0.01136,
    barsHeld: 4
  },
  {
    id: "aa704fb4-e5a9-472b-adde-a4313f0bc16f",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-01-22T03:56:27.566",
    profit: -0.00004,
    barsHeld: 1
  },
  {
    id: "8f48ead7-d646-4c4c-8519-24573407c44f",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-01-22T04:13:00.274",
    profit: 0.003654,
    barsHeld: 3
  },
  {
    id: "e9142f83-136e-4cc5-9b19-83483d813eff",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-01-22T04:23:50.158",
    profit: -0.001766,
    barsHeld: 2
  },
  {
    id: "782ab9c3-03d7-4c8d-ad86-b4c65698d4f8",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-01-22T05:15:07.355",
    profit: 0.02394,
    barsHeld: 11
  },
  {
    id: "52337ba0-5f58-4bc4-81ed-523dfefd3645",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-01-22T05:41:12.123",
    profit: 0.02076,
    barsHeld: 5
  },
  {
    id: "02071736-dc34-460d-9d8c-866a053516d5",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-01-22T05:54:01.836",
    profit: -0.00024,
    barsHeld: 2
  },
  {
    id: "905516b1-de5e-47d7-99ca-1d5b5c73129f",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-01-22T06:09:14.115",
    profit: -0.00024,
    barsHeld: 3
  },
  {
    id: "f8cd22a5-7d2d-47e6-be3c-7dc9f07678c0",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-01-22T07:06:54.608",
    profit: 0.06376,
    barsHeld: 12
  },
  {
    id: "433c65c1-8c72-4e3b-b7de-bfb2f6a2625f",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-01-22T07:16:20.172",
    profit: 0.003351,
    barsHeld: 2
  },
  {
    id: "c81a8cdf-d1db-4125-9f6c-33177f48fab9",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-01-22T07:33:10.102",
    profit: 0.045951,
    barsHeld: 3
  },
  {
    id: "68893bd6-21a9-46d8-b8d9-e983c737367f",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-01-22T08:00:08.586",
    profit: 0.086432,
    barsHeld: 6
  },
  {
    id: "df6aa118-1304-45f7-b9d5-52464f884338",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-01-22T08:07:14.295",
    profit: -0.011568,
    barsHeld: 1
  },
  {
    id: "c41c6dd5-41b7-4073-8d8c-a252fd839d8b",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-01-22T09:00:04.512",
    profit: 0.10236,
    barsHeld: 11
  },
  {
    id: "caadc850-a3eb-405d-9906-ddc2360d189a",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-01-22T09:05:03.668",
    profit: -0.00904,
    barsHeld: 1
  },
  {
    id: "7638d44a-1aee-4239-aadd-600a17b56f9c",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-01-22T09:16:23.339",
    profit: 0.00356,
    barsHeld: 2
  },
  {
    id: "3c7ac1f1-983a-41f5-b8c5-9282f4394419",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-01-22T09:21:12.443",
    profit: -0.00504,
    barsHeld: 1
  },
  {
    id: "8cdd2df3-90ab-4b73-9186-6c51e46a89f4",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-01-22T09:34:22.289",
    profit: 0.00536,
    barsHeld: 2
  },
  {
    id: "4f68949b-b31e-4775-9b43-d29bf9a62542",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-01-22T09:50:03.068",
    profit: 0.00336,
    barsHeld: 4
  },
  {
    id: "6404cf30-2665-41e9-af42-1d36c7da8a3b",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-01-22T09:57:35.335",
    profit: -0.02004,
    barsHeld: 1
  },
  {
    id: "56ab28fc-6afb-4c0c-9c18-8cbfd4e66d01",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-01-22T10:04:20.493",
    profit: -0.00024,
    barsHeld: 1
  },
  {
    id: "20f8ef60-a3eb-48a5-ab33-d9d29d1bd94f",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-01-22T10:26:00.563",
    profit: 0.03336,
    barsHeld: 5
  },
  {
    id: "35ec94a6-3fd5-46b6-9315-68dc1f901ca4",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-01-22T10:57:02.918",
    profit: 0.01416,
    barsHeld: 6
  },
  {
    id: "5e6702df-7fcf-4deb-959b-d06dcbd3669d",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-01-22T11:24:50.634",
    profit: 0.01736,
    barsHeld: 5
  },
  {
    id: "5085e9ce-4fbb-4949-b03b-f3d61885d636",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-01-22T11:39:12.346",
    profit: -0.00284,
    barsHeld: 3
  },
  {
    id: "80eedf92-2459-4f64-bb98-83303233154f",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-01-22T11:46:10.11",
    profit: 0.01636,
    barsHeld: 2
  },
  {
    id: "e8b6e09e-1cae-4de9-9ec9-e380a3e444bf",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-01-22T11:58:22.586",
    profit: 0.01836,
    barsHeld: 2
  },
  {
    id: "cf0cd2ef-d621-439c-a2b2-8ceff58a09b8",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-01-22T12:12:11.617",
    profit: 0.01456,
    barsHeld: 3
  },
  {
    id: "ab4107c0-62e4-464f-8994-296bd6f37d5b",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-01-22T13:01:02.191",
    profit: 0.02736,
    barsHeld: 10
  },
  {
    id: "8596f22e-d9ea-4a6c-a813-35be28f3c927",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-01-22T13:48:36.464",
    profit: 0.05416,
    barsHeld: 9
  },
  {
    id: "4d00dfe0-81bb-4a07-b469-206129451ece",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-01-22T13:57:18.379",
    profit: -0.00024,
    barsHeld: 2
  },
  {
    id: "7bc80ce9-24b0-460f-beed-bf56cb6bf05d",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-01-22T14:02:52.173",
    profit: -0.000127,
    barsHeld: 1
  },
  {
    id: "0682c207-b53f-4d7b-98f6-dca4e3e8d839",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-01-22T14:28:06.406",
    profit: 0.020473,
    barsHeld: 5
  },
  {
    id: "50428659-e660-4815-b705-4594b42d2d1e",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-01-22T15:22:52.556",
    profit: 0.00736,
    barsHeld: 11
  },
  {
    id: "661cec37-fe35-4913-8bd6-c55c9f91105f",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-01-22T15:41:32.706",
    profit: 0.01796,
    barsHeld: 4
  },
  {
    id: "6c110ec0-b756-4681-a952-f952e054f20f",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-01-22T15:55:40.71",
    profit: 0.00036,
    barsHeld: 3
  },
  {
    id: "410ebdfe-1eaf-49aa-8d29-db8c16c26c82",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-01-22T16:03:55.312",
    profit: -0.000177,
    barsHeld: 1
  },
  {
    id: "756714b9-ddec-445e-a95f-71cd42a401e6",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-01-22T16:21:11.589",
    profit: 0.009023,
    barsHeld: 4
  },
  {
    id: "aeeabfc0-fddf-4a84-9c57-fd7b5bd72549",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-01-22T16:29:32.245",
    profit: -0.00204,
    barsHeld: 1
  },
  {
    id: "311bd77e-7ba7-43e5-b93e-578a53f1686d",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-01-22T16:39:47.659",
    profit: -0.01144,
    barsHeld: 2
  },
  {
    id: "208aee86-b75c-4c2e-9f9e-dce9f678b7f6",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-01-22T17:21:23.858",
    profit: 0.03336,
    barsHeld: 9
  },
  {
    id: "6679c16f-bfe1-4770-bab0-7adfd77c8932",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-01-22T17:48:58.725",
    profit: 0.00956,
    barsHeld: 5
  },
  {
    id: "8ea5fd6d-daf2-4f06-b724-8179c15bdaca",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-01-22T18:17:52.372",
    profit: 0.00476,
    barsHeld: 6
  },
  {
    id: "0887e138-d397-4690-bfb8-1af8882300e7",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-01-22T19:27:43.142",
    profit: 0.04036,
    barsHeld: 14
  },
  {
    id: "f57e89d9-c7ec-4e77-b541-469f7dcadda4",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-01-22T20:00:15.245",
    profit: 0.02076,
    barsHeld: 7
  },
  {
    id: "2640f7f9-969d-49bf-9396-9cf44fc0ab86",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-01-22T20:19:27.97",
    profit: 0.01096,
    barsHeld: 3
  },
  {
    id: "3f2075bd-c779-4fda-8365-a2f1454958e4",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-01-22T20:23:52.862",
    profit: -0.00004,
    barsHeld: 1
  },
  {
    id: "e9fbb878-2564-449c-bd42-37a43163564b",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-01-22T20:30:16.101",
    profit: 0.00876,
    barsHeld: 2
  },
  {
    id: "d71fdbb8-0fca-4e46-be13-3ee05f8a37e1",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-01-22T21:05:16.376",
    profit: 0.01536,
    barsHeld: 7
  },
  {
    id: "e39c1d41-e8d1-4944-91d7-db17826f771f",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-01-22T21:24:19.446",
    profit: -0.00024,
    barsHeld: 3
  },
  {
    id: "b8a682b0-6a9c-4d2b-976b-11451ba90bd3",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-01-22T21:42:53.535",
    profit: -0.00304,
    barsHeld: 4
  },
  {
    id: "598d9fa9-b1bc-4ae8-a962-a3dde5f6725c",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-01-22T22:10:30.326",
    profit: -0.00664,
    barsHeld: 6
  },
  {
    id: "ba71eeae-514b-4e35-9d7d-42bfe9087917",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-01-22T22:40:35.875",
    profit: -0.00424,
    barsHeld: 6
  },
  {
    id: "29ef90af-ccca-490e-b2eb-6badef6758dd",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-01-22T23:13:55.389",
    profit: -0.00084,
    barsHeld: 6
  },
  {
    id: "6685b0fd-5863-491e-b0e2-c4c42b23db18",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-01-23T00:21:27.901",
    profit: 0.01816,
    barsHeld: 14
  },
  {
    id: "66eb5621-0c04-41fc-bfcc-9f86a051b81c",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-01-23T00:58:44.84",
    profit: 0.03116,
    barsHeld: 7
  },
  {
    id: "cee84e61-69b4-4809-9f21-780942fd7d5b",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-01-23T01:07:47.382",
    profit: -0.00384,
    barsHeld: 2
  },
  {
    id: "9fb3fef3-951f-4716-82cb-fbc6a42e820b",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-01-23T01:47:58.134",
    profit: 0.064222,
    barsHeld: 8
  },
  {
    id: "d0959c7d-6772-4946-97cc-c3669e49ab5e",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-01-23T01:56:02.113",
    profit: -0.020378,
    barsHeld: 2
  },
  {
    id: "6847c10c-0a91-4631-ab45-0571fc9aee73",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-01-23T02:15:12.977",
    profit: 0.03796,
    barsHeld: 4
  },
  {
    id: "c3712487-1330-4e78-953d-75162c7ecb52",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-01-23T02:20:13.722",
    profit: -0.03424,
    barsHeld: 1
  },
  {
    id: "ec0a8430-1f2a-41d8-9ebf-c7ce217c083f",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-01-23T02:33:33.39",
    profit: -0.0501,
    barsHeld: 2
  },
  {
    id: "ad70f6f0-5bff-48d8-a9cd-adb6de3e5fbc",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-01-23T02:40:12.079",
    profit: -0.0021,
    barsHeld: 2
  },
  {
    id: "c53e3bbd-901c-47cd-a21f-3c2d61fb0fda",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-01-23T02:53:56.304",
    profit: 0.02116,
    barsHeld: 2
  },
  {
    id: "5d47f7d2-8c66-402b-b5e2-7336a71224c9",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-01-23T03:22:08.631",
    profit: 0.01736,
    barsHeld: 6
  },
  {
    id: "b402732a-86e9-4ecb-93c8-2d73f514af9a",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-01-23T03:28:49.131",
    profit: -0.00004,
    barsHeld: 1
  },
  {
    id: "05d10d7e-c6b3-4a6d-9f91-2ad704a963a7",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-01-23T03:30:12.663",
    profit: -0.00584,
    barsHeld: 1
  },
  {
    id: "bd0e0ac9-4d73-4c72-88fc-1b7e7769ec13",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-01-23T03:46:00.175",
    profit: 0.00336,
    barsHeld: 3
  },
  {
    id: "ad7a358e-abd8-464e-8cc9-a105eda1df93",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-01-23T03:59:52.373",
    profit: 0.00896,
    barsHeld: 2
  },
  {
    id: "5837326e-1c9c-4188-9cac-659969e6fd6c",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-01-23T04:09:08.077",
    profit: 0.00036,
    barsHeld: 2
  },
  {
    id: "f01cad60-b7b1-41fc-b70e-1cdeee396761",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-01-23T04:23:37.517",
    profit: -0.00304,
    barsHeld: 3
  },
  {
    id: "80a37cf8-167c-4296-97b4-c405523ad46e",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-01-23T04:42:00.149",
    profit: 0.00836,
    barsHeld: 4
  },
  {
    id: "05d8121c-b06e-400e-924c-e72b6eae09b1",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-01-23T04:46:31.051",
    profit: -0.00604,
    barsHeld: 1
  },
  {
    id: "ea8c7fb4-ac6d-4b35-91bc-3d196a02628b",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-01-23T05:14:05.793",
    profit: 0.04516,
    barsHeld: 5
  },
  {
    id: "cec5b98c-4a0d-4ebc-af03-f3d8c3f391f8",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-01-23T05:21:46.33",
    profit: -0.03184,
    barsHeld: 2
  },
  {
    id: "1a6d875f-106f-4a48-a2b0-3bbf95af9ac4",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-01-23T05:30:22.835",
    profit: 0.038821,
    barsHeld: 2
  },
  {
    id: "bccaf06d-31af-40e6-a808-3bf54b4e13c2",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-01-23T05:35:44.644",
    profit: -0.027979,
    barsHeld: 1
  },
  {
    id: "27ce53d1-c42c-44af-b0ed-90ce08e1cf8d",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-01-23T05:40:03.948",
    profit: -0.02704,
    barsHeld: 1
  },
  {
    id: "149b274f-6638-4ff8-a51f-6aae4d2631c5",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-01-23T06:00:56.509",
    profit: 0.03796,
    barsHeld: 4
  },
  {
    id: "e1504e55-b785-4216-aad1-8267ad9da2f2",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-01-23T06:06:16.376",
    profit: -0.02344,
    barsHeld: 1
  },
  {
    id: "d800bc7b-a842-432c-82bb-c61a247cf65c",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-01-23T06:10:07.493",
    profit: -0.00204,
    barsHeld: 1
  },
  {
    id: "adb09cb7-d93e-44d7-a75d-e580b8df21a8",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-01-23T06:17:20.199",
    profit: -0.00124,
    barsHeld: 1
  },
  {
    id: "a2766d43-082f-48da-b5b2-1adf4d1a0f9b",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-01-23T06:23:32.02",
    profit: -0.04144,
    barsHeld: 1
  },
  {
    id: "0338a189-fb23-4682-8b89-d4047fadefd5",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-01-23T06:30:18.32",
    profit: 0.01016,
    barsHeld: 2
  },
  {
    id: "f4ef937b-e266-4eb3-924e-9532c7144f88",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-01-23T06:47:40.981",
    profit: 0.00576,
    barsHeld: 3
  },
  {
    id: "f919d2f2-3288-4a4c-8b30-be7e195c11bf",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-01-23T06:56:52.523",
    profit: 0.029581,
    barsHeld: 2
  },
  {
    id: "833ceb62-5308-4dfb-9aed-c99f6393753c",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-01-23T07:05:14.182",
    profit: -0.005819,
    barsHeld: 2
  },
  {
    id: "d942ea5d-379b-4114-8a4a-57585b2061fa",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-01-23T07:14:50.875",
    profit: -0.004194,
    barsHeld: 1
  },
  {
    id: "45ed3053-d7a3-4234-96c6-170db4cba3d0",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-01-23T07:31:24.176",
    profit: 0.102406,
    barsHeld: 4
  },
  {
    id: "d748f758-2d7b-4d2a-8473-400e3f3085a5",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-01-23T07:44:46.072",
    profit: -0.02344,
    barsHeld: 2
  },
  {
    id: "40ce0b7c-6cfb-42f0-9122-e88af85b5b02",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-01-23T08:00:44.341",
    profit: 0.00376,
    barsHeld: 4
  },
  {
    id: "bdc8c871-130a-4c8d-82f2-d8133b3c16e9",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-01-23T08:05:21.543",
    profit: -0.02924,
    barsHeld: 1
  },
  {
    id: "f9bb0e4e-6b06-4b1f-aa93-853bcc33b323",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-01-23T08:10:04.85",
    profit: -0.005644,
    barsHeld: 1
  },
  {
    id: "8dff34fd-a54d-46a0-b8fb-3da3394b0988",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-01-23T08:28:05.262",
    profit: -0.030044,
    barsHeld: 3
  },
  {
    id: "7e757430-6bf5-4f84-8d61-d0a57e697fb4",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-01-23T08:34:28.7",
    profit: -0.011302,
    barsHeld: 1
  },
  {
    id: "30764d9d-08c8-431b-bb39-56374d15cd80",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-01-23T08:45:28.591",
    profit: 0.115698,
    barsHeld: 3
  },
  {
    id: "08255cb0-7b79-458e-8b3a-a6f00d58fdae",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-01-23T08:50:27.08",
    profit: -0.06464,
    barsHeld: 1
  },
  {
    id: "24fe2426-dec6-4d12-a5bb-7b25211490c3",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-01-23T08:57:12.449",
    profit: -0.03084,
    barsHeld: 1
  },
  {
    id: "f3dae69c-de5c-423c-8dde-63a5ce065f9f",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-01-23T09:00:06.857",
    profit: -0.02944,
    barsHeld: 1
  },
  {
    id: "d58944df-3b19-41fc-922e-5875ff65b8e5",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-01-23T09:16:12.767",
    profit: 0.06976,
    barsHeld: 3
  },
  {
    id: "66cb80db-430c-4263-99af-cb1fc1911c22",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-01-23T09:25:22.424",
    profit: -0.00384,
    barsHeld: 2
  },
  {
    id: "1a348fc4-03fe-4a66-89d5-237bd16a04a2",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-01-23T09:36:16.069",
    profit: 0.00856,
    barsHeld: 2
  },
  {
    id: "095e20d6-a982-4913-888e-1b9746ab63ac",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-01-23T09:44:37.845",
    profit: -0.011407,
    barsHeld: 1
  },
  {
    id: "82c549a1-3c82-4d15-ab21-4c4f42da9fe3",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-01-23T09:50:56.184",
    profit: 0.001593,
    barsHeld: 2
  },
  {
    id: "876fa67a-1459-45c0-a51b-70eddc513a2a",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-01-23T10:00:03.638",
    profit: -0.02844,
    barsHeld: 2
  },
  {
    id: "32892c47-6771-4204-9297-3d1714f150c2",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-01-23T10:10:03.172",
    profit: 0.00556,
    barsHeld: 2
  },
  {
    id: "d147cc17-0c81-44d1-a070-7df70817fe25",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-01-23T10:28:51.441",
    profit: -0.02044,
    barsHeld: 3
  },
  {
    id: "346770a6-7de5-4795-bd84-49a7550ffd55",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-01-23T10:48:03.511",
    profit: 0.00556,
    barsHeld: 4
  },
  {
    id: "d740386d-1a7e-4def-b896-ecb05f265d13",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-01-23T11:07:16.074",
    profit: -0.00844,
    barsHeld: 4
  },
  {
    id: "156deba8-dff4-4a4e-9aad-005e16d8c4db",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-01-23T11:15:27.046",
    profit: 0.02036,
    barsHeld: 2
  },
  {
    id: "2561f71d-22d0-43cd-9420-951968bccc91",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-01-23T11:31:58.532",
    profit: 0.023092,
    barsHeld: 3
  },
  {
    id: "624fd681-e90b-4b91-90f0-93d34425bd0a",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-01-23T11:38:51.042",
    profit: -0.012736,
    barsHeld: 1
  },
  {
    id: "f0173720-55d3-4da0-a303-1e1a684ab56d",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-01-23T11:46:50.05",
    profit: 0.007834,
    barsHeld: 2
  },
  {
    id: "3c9746e2-653a-4d88-b56c-ccadeec9a0e6",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-01-23T12:12:26.097",
    profit: 0.068462,
    barsHeld: 5
  },
  {
    id: "a2851eda-c746-4a2c-a8ac-b8cc3f548463",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-01-23T12:30:22.48",
    profit: 0.01736,
    barsHeld: 4
  },
  {
    id: "f406e0c0-1f17-477c-bdb0-7f6d05a4bdf7",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-01-23T13:31:01.129",
    profit: 0.05536,
    barsHeld: 12
  },
  {
    id: "6c85af91-6832-407c-a621-4b989c67ab21",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-01-23T13:38:23.424",
    profit: -0.03684,
    barsHeld: 1
  },
  {
    id: "f8e08335-c6f0-4b24-943b-35927435fed3",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-01-23T14:15:08.863",
    profit: 0.05876,
    barsHeld: 8
  },
  {
    id: "1c21f5de-0c8e-4a5c-a799-64e6b108b5ce",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-01-23T14:58:02.349",
    profit: 0.05956,
    barsHeld: 8
  },
  {
    id: "df287379-fe9f-4f91-b4d9-b982e4cdd291",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-01-23T15:17:39.209",
    profit: -0.00924,
    barsHeld: 4
  },
  {
    id: "943f693f-cf46-49aa-b175-b6277c85109a",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-01-23T15:48:03.477",
    profit: 0.00756,
    barsHeld: 6
  },
  {
    id: "0b12c7a0-d693-458d-b0f4-532215826612",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-01-23T16:50:18.515",
    profit: 0.06876,
    barsHeld: 13
  },
  {
    id: "393f900a-cc69-43cf-b801-21f691c792bb",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-01-23T17:27:09.418",
    profit: 0.03736,
    barsHeld: 7
  },
  {
    id: "09d48988-239c-44f9-805c-061631d26632",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-01-23T18:10:37.299",
    profit: 0.08736,
    barsHeld: 9
  },
  {
    id: "f3538324-4981-4321-bb6c-eee93f8a76cb",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-01-23T19:58:51.285",
    profit: 0.0993,
    barsHeld: 21
  },
  {
    id: "832e80d5-e461-4ebe-8516-913b439e718f",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-01-24T00:13:34.868",
    profit: 0.0187,
    barsHeld: 51
  },
  {
    id: "703c548b-1fb3-475c-8817-80bfa84333c6",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-01-24T00:55:18.299",
    profit: 0.09896,
    barsHeld: 9
  },
  {
    id: "c8a16451-6374-4bdd-89ea-9ed6d0642002",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-01-24T01:00:21.549",
    profit: -0.00024,
    barsHeld: 1
  },
  {
    id: "7eec3e47-0278-4f3a-a6fc-ca7088b663b8",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-01-24T01:06:37.561",
    profit: -0.000104,
    barsHeld: 1
  },
  {
    id: "cf53f80f-153f-4654-8523-5945863622ac",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-01-24T01:38:38.664",
    profit: 0.054896,
    barsHeld: 6
  },
  {
    id: "620daef2-e981-4bbf-90ef-c9881af6cd1a",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-01-24T02:08:41.355",
    profit: -0.02744,
    barsHeld: 6
  },
  {
    id: "f26213ee-6c1c-41f7-924a-109db1987d5e",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-01-24T02:31:15.649",
    profit: 0.05016,
    barsHeld: 5
  },
  {
    id: "84fb4b87-b93e-4019-ac1e-14c8db42a87e",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-01-24T02:36:46.061",
    profit: -0.00604,
    barsHeld: 1
  },
  {
    id: "8c5e914c-1a44-4bdb-888a-78b6de294474",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-01-24T02:50:36.792",
    profit: 0.03696,
    barsHeld: 3
  },
  {
    id: "df1f8f2f-b71e-4ccf-b4ac-72406e2f9034",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-01-24T02:56:00.694",
    profit: -0.01804,
    barsHeld: 1
  },
  {
    id: "16ad3905-6263-47e2-a8cb-f3374c8ef97c",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-01-24T03:00:34.861",
    profit: -0.00024,
    barsHeld: 1
  },
  {
    id: "953c2620-55c5-4953-9527-bd24159b5c12",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-01-24T03:37:02.042",
    profit: 0.04456,
    barsHeld: 7
  },
  {
    id: "8a8bc776-967e-4f99-ba0d-edde2356a974",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-01-24T03:45:19.749",
    profit: -0.001417,
    barsHeld: 2
  },
  {
    id: "05010e71-5cd8-431c-9b8a-73059e11e8f8",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-01-24T03:55:09.434",
    profit: 0.042983,
    barsHeld: 2
  },
  {
    id: "b232f7e6-ead1-4d53-95aa-6c05c35d31a4",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-01-24T04:40:08.47",
    profit: 0.06316,
    barsHeld: 9
  },
  {
    id: "ac754a9a-e134-44c9-a1d7-5d0e843fef2f",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-01-24T04:56:35.337",
    profit: -0.01104,
    barsHeld: 3
  },
  {
    id: "5f35bbae-737e-42fd-be9b-76addb40b100",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-01-24T05:08:40.127",
    profit: -0.00964,
    barsHeld: 2
  },
  {
    id: "053a8351-4417-4b1e-969f-5d809743609a",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-01-24T05:10:06.27",
    profit: -0.00344,
    barsHeld: 1
  },
  {
    id: "edc3f855-aa5b-4315-8290-92ed1c277ae6",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-01-24T05:16:56.599",
    profit: -0.00004,
    barsHeld: 1
  },
  {
    id: "e5db29a5-33e5-4245-8f6a-1548a869604f",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-01-24T05:37:57.058",
    profit: 0.04056,
    barsHeld: 4
  },
  {
    id: "28601268-5114-4d26-af49-0dd532614ce7",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-01-24T06:03:43.14",
    profit: 0.018655,
    barsHeld: 5
  },
  {
    id: "1f44340d-fb50-43fc-b7cb-a79fb6c3bbe2",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-01-24T06:32:01.269",
    profit: 0.026255,
    barsHeld: 6
  },
  {
    id: "8d3870f6-3ccc-4903-abf5-ece21a9a5c37",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-01-24T06:51:56.367",
    profit: -0.000517,
    barsHeld: 4
  },
  {
    id: "98742b87-63cb-4780-8f93-c7e1a2b39859",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-01-24T07:09:39.395",
    profit: -0.010517,
    barsHeld: 3
  },
  {
    id: "e0a9f7ad-fc97-49d4-87ed-4356e8bd3d44",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-01-24T07:43:38.337",
    profit: 0.03196,
    barsHeld: 7
  },
  {
    id: "8c5b6458-b7d8-4bd0-91a5-7a1a499b1910",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-01-24T08:21:44.128",
    profit: 0.04256,
    barsHeld: 8
  },
  {
    id: "9e5cba29-85d9-4629-a49d-965cdbd05cbe",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-01-24T09:55:40.161",
    profit: 0.13056,
    barsHeld: 19
  },
  {
    id: "a294b25b-38fb-44b4-87e6-ba9886667959",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-01-24T10:00:16.785",
    profit: -0.00244,
    barsHeld: 1
  },
  {
    id: "e85edc0a-ddb0-4913-bd2f-5a9f4ddbae77",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-01-24T10:13:08.249",
    profit: -0.06644,
    barsHeld: 2
  },
  {
    id: "f9499849-4183-428a-88a6-bcdda52b60db",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-01-24T10:20:17.103",
    profit: -0.02344,
    barsHeld: 2
  },
  {
    id: "b3e50fd4-a9b4-497b-8e96-f35b44148661",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-01-24T11:04:54.122",
    profit: 0.07436,
    barsHeld: 8
  },
  {
    id: "a4b3e374-f4fb-425f-a75b-379edf398e0d",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-01-24T11:10:46.077",
    profit: -0.00664,
    barsHeld: 2
  },
  {
    id: "6886f19f-4563-41fb-94de-5aa1873eef4f",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-01-24T11:15:39.597",
    profit: -0.00684,
    barsHeld: 1
  },
  {
    id: "128184c0-0718-4119-b489-365a5d92d8c5",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-01-24T11:48:39.818",
    profit: 0.25216,
    barsHeld: 6
  },
  {
    id: "45961ec5-d07b-4a0a-a15b-a3ba7cc5d656",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-01-24T11:56:31.239",
    profit: -0.013521,
    barsHeld: 2
  },
  {
    id: "9af567e1-4f97-44dc-a826-dd3955f1cd14",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-01-24T12:05:04.155",
    profit: 0.033079,
    barsHeld: 2
  },
  {
    id: "da76f878-3b09-43ef-a874-52e5666735c2",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-01-24T12:26:24.727",
    profit: 0.026146,
    barsHeld: 4
  },
  {
    id: "0ab8b3f0-b7cd-4ef4-894f-61b47804f231",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-01-24T13:01:34.425",
    profit: 0.074746,
    barsHeld: 7
  },
  {
    id: "3052a248-1b14-4271-8876-e1ad1b69b811",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-01-24T13:11:56.446",
    profit: 0.000488,
    barsHeld: 2
  },
  {
    id: "28b7bedc-09ac-4d49-b5d2-4854a301ef24",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-01-24T13:19:32.098",
    profit: -0.016428,
    barsHeld: 1
  },
  {
    id: "54753dff-1630-4907-b9a6-99b968db1238",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-01-24T13:23:34.209",
    profit: -0.007756,
    barsHeld: 1
  },
  {
    id: "8004af0f-b2bc-43fa-a71b-e18d3d6dd764",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-01-24T13:34:51.122",
    profit: 0.00336,
    barsHeld: 2
  },
  {
    id: "530150a4-a5b4-48cc-9fad-5bcfb761d40c",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-01-24T13:40:39.299",
    profit: 0.010431,
    barsHeld: 2
  },
  {
    id: "2405da40-4a78-4137-a7e9-598bd83881c0",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-01-24T14:05:49.529",
    profit: 0.061768,
    barsHeld: 5
  },
  {
    id: "645c2c93-0fb6-4a34-87c8-36bd2e222da1",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-01-24T14:11:58.124",
    profit: -0.016374,
    barsHeld: 1
  },
  {
    id: "e4fc6608-3a6c-42af-bca0-7db15cb83161",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-01-24T14:20:42.391",
    profit: -0.007511,
    barsHeld: 2
  },
  {
    id: "7a7e9509-16f8-4d51-aa68-6cbd8f165a54",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-01-24T14:25:32.033",
    profit: -0.01084,
    barsHeld: 1
  },
  {
    id: "6b4869cc-0f94-4b7c-bef3-65ae9659f17a",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-01-24T14:41:19.556",
    profit: 0.02896,
    barsHeld: 3
  },
  {
    id: "869def35-4007-44cd-93df-3185716bc910",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-01-24T15:05:17.388",
    profit: 0.00196,
    barsHeld: 5
  },
  {
    id: "33a63639-39f0-4c47-820f-34ece4dc64fe",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-01-24T15:10:48.175",
    profit: -0.02844,
    barsHeld: 1
  },
  {
    id: "20fe4656-7d0f-4131-a941-6017b65ff1c4",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-01-24T15:19:36.268",
    profit: -0.000158,
    barsHeld: 1
  },
  {
    id: "ebcb0922-f471-41d7-8ac0-015581c2fb4d",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-01-24T15:34:47.733",
    profit: 0.049442,
    barsHeld: 3
  },
  {
    id: "5828295c-1139-4279-896c-232b10a3d0b6",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-01-24T15:45:52.943",
    profit: -0.01044,
    barsHeld: 3
  },
  {
    id: "e5be6899-90e5-4f34-977a-844f2420763e",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-01-24T15:57:24.699",
    profit: 0.00516,
    barsHeld: 2
  },
  {
    id: "548fc103-3869-4ea9-a043-8d7865397677",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-01-24T16:00:34.493",
    profit: -0.01284,
    barsHeld: 1
  },
  {
    id: "6b4a1bb9-374a-4799-9fc2-cd793f95cc33",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-01-24T16:06:22.33",
    profit: -0.02759,
    barsHeld: 1
  },
  {
    id: "7e83a867-c811-4f59-8360-ff2150780269",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-01-24T16:10:08.461",
    profit: -0.019476,
    barsHeld: 1
  },
  {
    id: "3b72edaa-52ca-4a87-ab04-11dd1e4efbd6",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-01-24T16:24:38.542",
    profit: -0.029726,
    barsHeld: 2
  },
  {
    id: "65d66821-87e1-4e9b-86ad-f4b8380cd025",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-01-24T17:08:28.869",
    profit: 0.02196,
    barsHeld: 9
  },
  {
    id: "ab6747f0-b97b-446e-bb6d-a965560c0489",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-01-24T17:13:42.241",
    profit: -0.02364,
    barsHeld: 1
  },
  {
    id: "dcf52691-4a74-46be-afe4-ad20ee51ad6a",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-01-24T17:30:14.227",
    profit: -0.00024,
    barsHeld: 4
  },
  {
    id: "7c51bb3e-94d8-4668-b636-5ff65e3c5a28",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-01-24T17:51:13.469",
    profit: 0.02736,
    barsHeld: 4
  },
  {
    id: "73e207fb-f189-46ed-ab7c-c3c610b3b2d8",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-01-24T17:56:01.303",
    profit: -0.02084,
    barsHeld: 1
  },
  {
    id: "3d20645d-3590-4a29-b384-63c38f1f8a4d",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-01-24T18:33:21.07",
    profit: 0.01156,
    barsHeld: 7
  },
  {
    id: "c37a9887-461b-4969-9bca-a881b13ab550",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-01-24T18:58:35.396",
    profit: 0.01036,
    barsHeld: 5
  },
  {
    id: "863629cd-31bf-4b06-b5ad-bee3dfec6eb1",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-01-24T19:39:17.139",
    profit: 0.04376,
    barsHeld: 8
  },
  {
    id: "efea6a60-9b21-40b3-b928-d01d7148dcab",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-01-24T19:49:04.789",
    profit: -0.01564,
    barsHeld: 2
  },
  {
    id: "24ccb3cd-e9fc-4337-82c5-cc8fc9607b60",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-01-24T20:00:18.129",
    profit: 0.00076,
    barsHeld: 3
  },
  {
    id: "6200247f-3c6d-4796-929d-4285ec323d3c",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-01-24T20:44:46.627",
    profit: 0.06236,
    barsHeld: 8
  },
  {
    id: "ff79c5cf-0edd-42b4-a61a-65b6100e4c82",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-01-24T21:35:39.263",
    profit: 0.041904,
    barsHeld: 11
  },
  {
    id: "aec30549-cc72-4648-a377-fb3a17ad567c",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-01-24T21:50:20.405",
    profit: -0.016096,
    barsHeld: 3
  },
  {
    id: "b17e2e39-db4f-4497-95b7-2a3b45dc0598",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-01-28T19:58:38.517",
    profit: 1.02516,
    barsHeld: 1129
  },
  {
    id: "1e4adf3c-b696-4ac8-a520-292ddecb223c",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-01-28T20:01:58.507",
    profit: -0.03324,
    barsHeld: 1
  },
  {
    id: "320ecec3-35eb-4386-bb0f-2927f855ba1b",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-01-28T20:45:08.547",
    profit: 0.07596,
    barsHeld: 9
  },
  {
    id: "89e87d29-2a3c-4ded-a529-cfb9816a723a",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-01-28T21:03:09.017",
    profit: 0.01196,
    barsHeld: 3
  },
  {
    id: "03732d57-551d-4df4-a9a8-57ce3d7176a0",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-01-28T21:24:45.867",
    profit: 0.05516,
    barsHeld: 4
  },
  {
    id: "b07a24bb-0a1f-415c-b91a-e542b60719f9",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-01-28T21:46:23.706",
    profit: 0.03636,
    barsHeld: 5
  },
  {
    id: "2cd5f7c2-e594-47c2-a010-829c68081f54",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-01-28T21:58:46.435",
    profit: -0.00524,
    barsHeld: 2
  },
  {
    id: "7ecb9c7d-2e7c-4c8d-9fc8-6460ab6ce50a",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-01-28T22:16:45.374",
    profit: 0.00076,
    barsHeld: 4
  },
  {
    id: "d9647f1b-8316-4d08-8e55-0782dbc1a085",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-01-28T23:00:18.203",
    profit: 0.14676,
    barsHeld: 9
  },
  {
    id: "3a13ac27-a71a-4d4c-b72e-da691579492f",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-01-28T23:23:48.089",
    profit: -0.02604,
    barsHeld: 4
  },
  {
    id: "e2b404b1-2da9-42af-84e8-de7f0fa64462",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-01-29T01:20:02.197",
    profit: 0.42076,
    barsHeld: 24
  },
  {
    id: "3f932cce-75db-4064-bed8-33d45cf504f8",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-01-29T01:35:58.875",
    profit: 0.01196,
    barsHeld: 3
  },
  {
    id: "58b9af7f-ba47-4826-b91d-1316bcde0003",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-01-29T01:40:48.284",
    profit: -0.03904,
    barsHeld: 1
  },
  {
    id: "a65cf8bd-269f-47c4-a0a3-dc22de9b9804",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-01-29T02:01:04.617",
    profit: -0.01384,
    barsHeld: 4
  },
  {
    id: "434a3602-bad7-40b6-9f24-02d8ee2caae5",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-01-29T02:21:53.646",
    profit: -0.01024,
    barsHeld: 4
  },
  {
    id: "5a07e9c2-4466-47d7-8a82-3c8697b8ec87",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-01-29T02:35:57.423",
    profit: 0.055733,
    barsHeld: 3
  },
  {
    id: "bc595e45-9a90-4972-94d1-d546c6cb5968",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-01-29T02:46:08.59",
    profit: -0.014467,
    barsHeld: 2
  },
  {
    id: "c8fb07e4-657e-4dba-b8ab-34a2d9decf51",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-01-29T02:50:54.186",
    profit: -0.02484,
    barsHeld: 1
  },
  {
    id: "681f66a8-5fe5-41ca-8a24-732d45ea1683",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-01-29T03:28:34.22",
    profit: 0.00936,
    barsHeld: 7
  },
  {
    id: "dbfbb112-36e2-4b25-b5fa-24012248d1b5",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-01-29T03:39:01.83",
    profit: -0.03464,
    barsHeld: 2
  },
  {
    id: "b2bab5eb-2973-4df2-ad30-139a55bf5c48",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-01-29T04:15:37.169",
    profit: -0.00564,
    barsHeld: 8
  },
  {
    id: "8d2078b9-d7fb-45b4-b4b4-da436b449575",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-01-29T04:54:50.074",
    profit: 0.01016,
    barsHeld: 7
  },
  {
    id: "cc187460-5b1c-43fc-a14c-f481a77f00e3",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-01-29T06:38:48.412",
    profit: 0.06756,
    barsHeld: 21
  },
  {
    id: "bb96c870-9435-4c76-9630-6bf3e02e118e",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-01-29T07:38:57.496",
    profit: 0.03376,
    barsHeld: 12
  },
  {
    id: "3bfbd923-341a-4ba4-a838-1c9d121085db",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-01-29T08:10:14.359",
    profit: -0.01724,
    barsHeld: 7
  },
  {
    id: "498a8b1d-5539-4de6-aa7f-15aaf4ac1198",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-01-29T08:28:43.857",
    profit: -0.046188,
    barsHeld: 3
  },
  {
    id: "4c47637f-c549-4d13-9a99-a35cedb17484",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-01-29T09:10:07.269",
    profit: -0.007188,
    barsHeld: 9
  },
  {
    id: "20d422b3-0e6e-4cb9-97ee-0416ac243918",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-01-29T10:15:26.059",
    profit: 0.12036,
    barsHeld: 13
  },
  {
    id: "a3f3f51b-11f1-4e88-926b-311cd649d3bf",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-01-29T11:01:49.254",
    profit: 0.15056,
    barsHeld: 9
  },
  {
    id: "9111136f-2f4d-46c3-a69c-1378d7e2d3ee",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-01-29T11:54:00.594",
    profit: 0.19316,
    barsHeld: 10
  },
  {
    id: "d4cfe296-5c66-496a-a947-79cd2dfd5a75",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-01-29T12:07:16.798",
    profit: 0.02516,
    barsHeld: 3
  },
  {
    id: "7952e4a0-4829-4c8c-a06f-7223dcc2cf7b",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-01-29T12:25:05.159",
    profit: 0.04636,
    barsHeld: 4
  },
  {
    id: "e3d3b2ce-cd78-485d-ba59-a4387b2817bd",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-01-29T12:41:16.578",
    profit: 0.04016,
    barsHeld: 3
  },
  {
    id: "e63051de-29fc-4191-8ef3-be3da1dd439e",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-01-29T13:02:39.246",
    profit: 0.02456,
    barsHeld: 4
  },
  {
    id: "8a7ee1f5-658c-4ebb-8be7-f74678ac1c08",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-01-29T13:06:27.089",
    profit: -0.00444,
    barsHeld: 1
  },
  {
    id: "54863b3d-0e83-408d-8f82-a12d7fbd797f",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-01-29T13:12:21.475",
    profit: -0.00464,
    barsHeld: 1
  },
  {
    id: "1cde9047-fdbf-462a-ba10-41dc88d492a0",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-01-29T13:26:34.277",
    profit: 0.05856,
    barsHeld: 3
  },
  {
    id: "0b1d274a-b172-491a-9e79-6ad33a64ad91",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-01-29T14:20:14.625",
    profit: -0.02944,
    barsHeld: 11
  },
  {
    id: "94b28e0a-6233-4ca6-b958-7c23f6bf25f7",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-01-29T15:06:37.31",
    profit: -0.01964,
    barsHeld: 9
  },
  {
    id: "da2901fd-074b-44a1-85e9-49980c4978e3",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-01-29T16:09:27.959",
    profit: 0.029388,
    barsHeld: 12
  },
  {
    id: "34a580e9-c5b6-439f-9d79-f3aece432c8d",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-01-29T16:38:45.476",
    profit: 0.047388,
    barsHeld: 6
  },
  {
    id: "194dc742-3dd8-4b2f-a5e4-e81aed0ce346",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-01-29T16:45:48.424",
    profit: -0.02044,
    barsHeld: 2
  },
  {
    id: "4a678e72-63bf-4b21-877c-650819f523ac",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-01-29T17:11:41.53",
    profit: 0.00956,
    barsHeld: 5
  },
  {
    id: "ceb1afbd-8634-4a2d-a9e1-cc2f93727444",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-01-29T17:23:37.407",
    profit: -0.02624,
    barsHeld: 2
  },
  {
    id: "8d6ebe62-5f17-4aaf-bead-8c5949cc5965",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-01-29T18:51:36.085",
    profit: 0.01836,
    barsHeld: 18
  },
  {
    id: "b127416a-e447-4bbb-a428-b39bab97ae24",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-01-29T19:25:49.285",
    profit: 0.02896,
    barsHeld: 7
  },
  {
    id: "0510fa03-b33a-45fc-b61a-bc12fa0ec93d",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-01-29T19:53:39.598",
    profit: 0.06136,
    barsHeld: 5
  },
  {
    id: "7a02edce-48e8-48d0-886e-a6335939ce02",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-01-29T20:40:39.692",
    profit: -0.01624,
    barsHeld: 10
  },
  {
    id: "0c838abc-f4c4-42e5-aa20-2b43174d108d",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-01-29T21:22:12.138",
    profit: -0.01824,
    barsHeld: 8
  },
  {
    id: "3902483b-fc5b-43d4-937e-b05d912f7bba",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-01-29T21:55:31.199",
    profit: 0.04356,
    barsHeld: 7
  },
  {
    id: "e4f7b924-e23c-4a10-9db8-1c3a47db04d9",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-01-29T22:15:45.106",
    profit: -0.00364,
    barsHeld: 4
  },
  {
    id: "e5df6445-b992-48d8-be9b-57ddf6e9ef5d",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-01-29T22:49:38.561",
    profit: 0.03156,
    barsHeld: 6
  },
  {
    id: "84f0cae6-20b8-4cab-b38a-b59ef58b01be",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-01-29T23:03:14.34",
    profit: -0.00604,
    barsHeld: 3
  },
  {
    id: "beb235b8-0d97-479f-b166-719dc5989f64",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-01-29T23:05:31.67",
    profit: -0.02244,
    barsHeld: 1
  },
  {
    id: "3711c1c5-6b7c-44af-978f-7c01d01e07b0",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-01-29T23:27:08.172",
    profit: -0.006833,
    barsHeld: 4
  },
  {
    id: "6c5ff714-55ae-42ab-b545-c2dd15d18909",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-01-29T23:40:04.831",
    profit: 0.007167,
    barsHeld: 3
  },
  {
    id: "220c853c-bef7-4d50-b196-f27905802147",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-01-29T23:48:28.08",
    profit: -0.01584,
    barsHeld: 1
  },
  {
    id: "4fbd9a80-ac9d-4f0b-81c6-52f939dd3ed8",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-01-30T00:03:56.538",
    profit: 0.04676,
    barsHeld: 3
  },
  {
    id: "0f6b6c85-180c-4763-b6af-2f78b1201640",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-01-30T00:10:03.179",
    profit: -0.040825,
    barsHeld: 2
  },
  {
    id: "5be10c01-71a2-4aa4-b723-1ee57ad2ea5d",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-01-30T00:39:18.443",
    profit: 0.099175,
    barsHeld: 5
  },
  {
    id: "7d43c353-7138-440c-9862-449819f6b2b5",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-01-30T01:00:45.457",
    profit: 0.06796,
    barsHeld: 5
  },
  {
    id: "e0e3a26a-3e69-403f-834b-18501b29100c",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-01-30T01:13:46.77",
    profit: -0.01004,
    barsHeld: 2
  },
  {
    id: "58de61d9-bb96-458b-8e91-b1a858d2e5e3",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-01-30T01:19:39.584",
    profit: -0.02024,
    barsHeld: 1
  },
  {
    id: "437a747e-a192-4944-a6ae-ac42f3c6190d",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-01-30T01:39:55.725",
    profit: 0.00196,
    barsHeld: 4
  },
  {
    id: "0f6e305b-3691-4741-bb82-05bb611299e0",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-01-30T02:13:26.529",
    profit: 0.01436,
    barsHeld: 7
  },
  {
    id: "15bf0bdb-3ab6-44fe-9183-5590430d5cc9",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-01-30T03:08:12.158",
    profit: 0.04096,
    barsHeld: 11
  },
  {
    id: "41297cae-18a5-4d32-bd39-0db4c07db0f7",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-01-30T03:55:35.235",
    profit: 0.04936,
    barsHeld: 10
  },
  {
    id: "df513afd-67c3-4c36-a1f1-bb394805e7f8",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-01-30T04:09:11.158",
    profit: -0.01564,
    barsHeld: 2
  },
  {
    id: "bc9308fa-e2f5-41b1-a6cb-23f2b0303ad1",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-01-30T04:32:22.498",
    profit: 0.12376,
    barsHeld: 5
  },
  {
    id: "a4999622-e8a7-41d0-9e6a-deb3d52208b7",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-01-30T04:35:41.468",
    profit: -0.00984,
    barsHeld: 1
  },
  {
    id: "c08aaeba-6aff-4390-875c-ffa17c592009",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-01-30T04:44:13.941",
    profit: -0.01344,
    barsHeld: 1
  },
  {
    id: "4d282e2d-db2e-4a29-beb8-f79ba4384576",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-01-30T05:00:13.51",
    profit: 0.02716,
    barsHeld: 4
  },
  {
    id: "b5209c44-0e4e-40fe-98c6-745d46f8e144",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-01-30T05:10:46.19",
    profit: 0.02896,
    barsHeld: 2
  },
  {
    id: "1b8de054-aacf-46a7-9fa1-b6aba7a933a6",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-01-30T05:24:55.592",
    profit: 0.02036,
    barsHeld: 2
  },
  {
    id: "e8753756-78dc-47a9-87f4-1b52e124e45e",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-01-30T05:27:13.535",
    profit: -0.01644,
    barsHeld: 1
  },
  {
    id: "d1e64e55-670c-413c-bef1-21e98996bab2",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-01-30T05:35:35.621",
    profit: -0.01264,
    barsHeld: 2
  },
  {
    id: "6914c651-ec2c-446c-94d8-c4fb295479db",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-01-30T05:41:52.685",
    profit: -0.0001,
    barsHeld: 1
  },
  {
    id: "286beeab-0f55-4cdb-83ad-98a38881114c",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-01-30T06:07:45.919",
    profit: 0.0299,
    barsHeld: 5
  },
  {
    id: "f0db2cfa-f3c8-4713-983b-337d1529310e",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-01-30T06:50:32.676",
    profit: 0.02396,
    barsHeld: 9
  },
  {
    id: "81b2bec6-790b-41f2-b028-12ed38167f17",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-01-30T07:16:13.207",
    profit: -0.01664,
    barsHeld: 5
  },
  {
    id: "4f70008d-8bfe-4906-8f5a-c23e9f80fa31",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-01-30T07:58:10.241",
    profit: 0.08956,
    barsHeld: 8
  },
  {
    id: "2e0867af-e80d-422e-bfa3-dd9725db1e53",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-01-30T08:09:57.346",
    profit: -0.00604,
    barsHeld: 2
  },
  {
    id: "656a73db-6b92-4987-965a-e15f08d6759e",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-01-30T08:18:14.158",
    profit: -0.00964,
    barsHeld: 2
  },
  {
    id: "a4450659-68ea-4937-968e-08c5a0dd3027",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-01-30T09:00:46.143",
    profit: 0.01436,
    barsHeld: 9
  },
  {
    id: "dc98b062-1281-4dc8-a320-caa4b104791f",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-01-30T09:07:03.236",
    profit: -0.02604,
    barsHeld: 1
  },
  {
    id: "ba15d5a9-9be9-49f0-bc36-c6730b171bed",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-01-30T09:29:26.216",
    profit: 0.02936,
    barsHeld: 4
  },
  {
    id: "bfe9996f-5554-4419-9991-9b292578e77b",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-01-30T10:10:26.875",
    profit: 0.01096,
    barsHeld: 9
  },
  {
    id: "a80c1eef-2e1d-4ca2-9d12-c42f1239593f",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-01-30T11:39:01.466",
    profit: 0.02556,
    barsHeld: 17
  },
  {
    id: "aeb35ab3-d437-42c5-931a-ee7ee864f8eb",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-01-30T13:00:52.295",
    profit: 0.07256,
    barsHeld: 17
  },
  {
    id: "aaed3353-2dc4-41b5-9d5e-eb1743249eba",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-01-30T13:25:19.759",
    profit: -0.01984,
    barsHeld: 5
  },
  {
    id: "b3a37047-acba-4ff0-bb69-78c61999d93e",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-01-30T13:59:27.451",
    profit: 0.01176,
    barsHeld: 6
  },
  {
    id: "ba4fcf8d-57ed-4e50-9706-76fa53a95211",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-01-30T14:02:21.155",
    profit: -0.00464,
    barsHeld: 1
  },
  {
    id: "cbdf5b48-f23c-460f-8ec6-084b0657cb18",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-01-30T14:05:18.236",
    profit: -0.08584,
    barsHeld: 1
  },
  {
    id: "091401ed-a4b0-466d-84ea-1f3b0a1cbb94",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-01-30T14:20:20.907",
    profit: -0.01324,
    barsHeld: 3
  },
  {
    id: "c15daecc-6f42-48a2-8eaa-dc0478faf1b9",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-01-30T14:42:03.357",
    profit: 0.01236,
    barsHeld: 4
  },
  {
    id: "e318ba0d-7e50-462e-bb08-2ae76a45d0dd",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-01-30T14:50:03.341",
    profit: 0.01276,
    barsHeld: 2
  },
  {
    id: "f3732b55-9893-43d7-a362-737a57b522d3",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-01-30T14:56:00.317",
    profit: -0.02784,
    barsHeld: 1
  },
  {
    id: "c9b2ed9b-08ec-410c-9575-61683018439c",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-01-30T15:01:27.419",
    profit: -0.01744,
    barsHeld: 1
  },
  {
    id: "2c5ceaf6-bab2-4626-914a-f591eb212f0a",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-01-30T15:05:03.553",
    profit: -0.00384,
    barsHeld: 1
  },
  {
    id: "20647677-7b3c-4d80-82b8-99f106f921f5",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-01-30T15:18:29.494",
    profit: -0.00624,
    barsHeld: 2
  },
  {
    id: "ef741ab7-7a68-4d40-ada2-6c4ae1dd00b6",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-01-30T15:47:33.973",
    profit: 0.03216,
    barsHeld: 6
  },
  {
    id: "3d61112e-36d9-4188-a653-11451b638293",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-01-30T15:50:04.34",
    profit: -0.01984,
    barsHeld: 1
  },
  {
    id: "d9923094-46ef-46cd-bf14-2382d795e8db",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-01-30T16:19:51.922",
    profit: 0.00136,
    barsHeld: 5
  },
  {
    id: "c447681c-17e1-40f9-9c65-c0342e734f2d",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-01-30T16:23:19.723",
    profit: -0.06424,
    barsHeld: 1
  },
  {
    id: "e68ba7f7-7b5c-4e1a-bc84-46d8b8d89af2",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-01-30T16:30:02.442",
    profit: -0.06744,
    barsHeld: 2
  },
  {
    id: "fa1511f0-3b0f-44e8-8c9c-f932bebc50f1",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-01-30T16:40:59.33",
    profit: 0.17396,
    barsHeld: 2
  },
  {
    id: "8c7810ad-5f04-4ac0-b945-a23facb9d08c",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-01-30T17:39:49.751",
    profit: 0.31336,
    barsHeld: 11
  },
  {
    id: "0f4da6f7-3b4d-43ca-9221-b7a69c26deb3",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-01-30T18:07:45.323",
    profit: -0.06744,
    barsHeld: 6
  },
  {
    id: "fa797e40-6399-479f-98b1-1170e75fb9e5",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-01-30T18:20:48.496",
    profit: -0.01704,
    barsHeld: 3
  },
  {
    id: "2119dd9c-bea7-49cf-9e18-9a1fdce46b4a",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-01-30T18:43:36.096",
    profit: -0.025942,
    barsHeld: 4
  },
  {
    id: "0f04cf8b-918a-4f29-bc2d-8cc3438b954b",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-01-30T19:22:20.567",
    profit: -0.009542,
    barsHeld: 8
  },
  {
    id: "a928ac0f-887d-449c-93d1-a39ee835df4f",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-01-30T19:48:34.925",
    profit: 0.01856,
    barsHeld: 5
  },
  {
    id: "95e0fe77-2b60-4ae9-92bf-f15f700b7fc2",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-01-30T21:28:33.029",
    profit: 0.10896,
    barsHeld: 20
  },
  {
    id: "01a8c583-32f1-4009-b416-fc8ddbcbfe42",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-01-30T21:56:13.392",
    profit: 0.00456,
    barsHeld: 6
  },
  {
    id: "67f06584-3cee-4744-a2db-579092ff381c",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-01-30T22:26:25.275",
    profit: -0.00204,
    barsHeld: 6
  },
  {
    id: "71861fec-15a4-403b-96c3-51ce54d61a66",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-01-30T22:54:13.312",
    profit: -0.03284,
    barsHeld: 5
  },
  {
    id: "07a07b76-a24d-4ef1-aa21-d09bc5f9ef08",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-01-30T23:05:04.736",
    profit: -0.01284,
    barsHeld: 3
  },
  {
    id: "98863263-d5c2-4a76-8bde-0f7993c85aeb",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-01-30T23:50:23.481",
    profit: 0.08816,
    barsHeld: 9
  },
  {
    id: "631bb9db-60a9-4dd1-b8c1-a16020e120fc",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-01-31T00:09:25.081",
    profit: -0.00364,
    barsHeld: 3
  },
  {
    id: "87c63813-a7f5-45ae-adf7-b4498b35187e",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-01-31T00:10:13.161",
    profit: -0.00024,
    barsHeld: 1
  },
  {
    id: "8f5548ac-d8b3-4e24-8f3f-5d4f9c09d808",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-01-31T00:41:46.476",
    profit: 0.031548,
    barsHeld: 6
  },
  {
    id: "fac5fa26-bb46-4ff9-ad30-c4d0ec9e2d58",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-01-31T01:05:47.114",
    profit: 0.077766,
    barsHeld: 5
  },
  {
    id: "7b894c83-8aee-4afd-ada0-071e081b8dca",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-01-31T01:28:53.54",
    profit: 0.031778,
    barsHeld: 4
  },
  {
    id: "9c8f71a6-733b-4bed-9a55-01a36d8e6eff",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-01-31T01:43:53.817",
    profit: 0.01976,
    barsHeld: 3
  },
  {
    id: "1e1bf650-7463-4514-9e7e-15587c380707",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-01-31T01:52:34.447",
    profit: 0.001905,
    barsHeld: 2
  },
  {
    id: "bd5832a6-3e55-441b-bc0e-a4929493fe31",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-01-31T02:26:44.132",
    profit: 0.105905,
    barsHeld: 7
  },
  {
    id: "a5d5460e-8eec-4620-adce-010c6b532f12",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-01-31T02:35:06.443",
    profit: 0.02596,
    barsHeld: 2
  },
  {
    id: "6bd9c689-063d-400c-b545-e4eebea7cd27",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-01-31T02:42:15.071",
    profit: -0.00004,
    barsHeld: 1
  },
  {
    id: "f84029e3-a805-467e-b2cb-5919a340bd28",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-01-31T03:00:44.52",
    profit: 0.01416,
    barsHeld: 4
  },
  {
    id: "9cb9cd1f-ba6b-48a1-8bd4-52b161866860",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-01-31T03:07:13.551",
    profit: -0.01424,
    barsHeld: 1
  },
  {
    id: "610a3039-b051-4b02-9637-d18647cebf09",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-01-31T03:26:06.581",
    profit: 0.01676,
    barsHeld: 4
  },
  {
    id: "2d5e000a-98a0-4d93-90d0-30873ce737df",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-01-31T03:33:50.085",
    profit: -0.00824,
    barsHeld: 1
  },
  {
    id: "ab776248-23be-4e45-b24a-987581c41386",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-01-31T03:43:53.98",
    profit: -0.02784,
    barsHeld: 2
  },
  {
    id: "d0d10c37-477f-4bfd-aaa4-4fc7bd0627d8",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-01-31T03:45:50.306",
    profit: -0.02844,
    barsHeld: 1
  },
  {
    id: "d85209e2-da71-4c55-9bfd-e055da78ad1a",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-01-31T03:54:19.405",
    profit: -0.05104,
    barsHeld: 1
  },
  {
    id: "67b93536-bc90-4c1b-a76b-8840b4ae4470",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-01-31T04:17:51.03",
    profit: 0.03376,
    barsHeld: 5
  },
  {
    id: "71ff8746-9ece-4b8b-a63a-1f14839f62f6",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-01-31T04:44:54.083",
    profit: 0.01456,
    barsHeld: 5
  },
  {
    id: "0b15bcde-cbde-46eb-8cdd-d465dcfff256",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-01-31T05:01:28.409",
    profit: 0.00316,
    barsHeld: 4
  },
  {
    id: "4229405e-a1d2-4fcd-8046-b3b04ae61222",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-01-31T05:22:40.087",
    profit: -0.01124,
    barsHeld: 4
  },
  {
    id: "8a545e9c-e101-4897-8d39-58fe553a4269",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-01-31T06:09:00.109",
    profit: 0.12556,
    barsHeld: 9
  },
  {
    id: "7512e5e9-480c-461a-96b3-7ff9278a83d1",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-01-31T06:15:03.019",
    profit: 0.01096,
    barsHeld: 2
  },
  {
    id: "b370a500-f6ed-4b5a-9708-908d719226d1",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-01-31T06:21:56.228",
    profit: -0.01164,
    barsHeld: 1
  },
  {
    id: "7a6a6b8c-2a9a-4c37-9e22-6c8d1fb21537",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-01-31T06:35:30.27",
    profit: 0.04076,
    barsHeld: 3
  },
  {
    id: "0585b6c8-602f-41f6-bcd5-c5037edfab4e",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-01-31T06:51:33.038",
    profit: 0.02776,
    barsHeld: 3
  },
  {
    id: "d23e4b87-c97c-42f8-b8ea-87a44a6a9faf",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-01-31T07:04:46.378",
    profit: -0.00164,
    barsHeld: 2
  },
  {
    id: "a45ab41e-3f0c-4ac1-8aac-ba59aab97158",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-01-31T07:36:52.479",
    profit: 0.06276,
    barsHeld: 7
  },
  {
    id: "8b448b71-2d36-4079-bc94-435f30d751a1",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-01-31T07:41:58.489",
    profit: -0.00624,
    barsHeld: 1
  },
  {
    id: "c7925835-6e78-4787-a6d5-1060a78cbad5",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-01-31T07:50:22.857",
    profit: -0.01084,
    barsHeld: 2
  },
  {
    id: "fad00408-82bf-47f7-8034-734ecddaee6f",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-01-31T08:06:05.726",
    profit: 0.01556,
    barsHeld: 3
  },
  {
    id: "aaeed890-3849-4ff9-9b1b-7d22ebe61908",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-01-31T08:19:03.019",
    profit: -0.02084,
    barsHeld: 2
  },
  {
    id: "2bd7c898-5d4c-4d4f-9d6b-f35df0f37501",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-01-31T08:52:37.568",
    profit: 0.04776,
    barsHeld: 7
  },
  {
    id: "710e0cfc-9cbe-4632-9455-6bd9f1e8367c",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-01-31T09:17:36.333",
    profit: -0.02184,
    barsHeld: 5
  },
  {
    id: "06a4c675-dc30-4133-97f2-60f66fca9c17",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-01-31T09:30:41.186",
    profit: -0.00104,
    barsHeld: 3
  },
  {
    id: "1cde78d3-0acd-4d30-acae-906ce06b3bca",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-01-31T10:12:12.069",
    profit: 0.04576,
    barsHeld: 8
  },
  {
    id: "5985bd2a-550d-4a11-ad31-02201acbfe3f",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-01-31T10:15:27.87",
    profit: -0.01284,
    barsHeld: 1
  },
  {
    id: "58d9e26e-f61f-4140-9e15-449472ff2bfa",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-01-31T10:26:28.067",
    profit: 0.00316,
    barsHeld: 2
  },
  {
    id: "b46b5d18-e60c-448d-becb-fd151d5430c1",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-01-31T10:45:54.446",
    profit: 0.00436,
    barsHeld: 4
  },
  {
    id: "eccad86d-81a1-4146-a380-e36b547199c6",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-01-31T10:55:51.482",
    profit: 0.07296,
    barsHeld: 2
  },
  {
    id: "e7558e3c-b2fb-46c1-8e9a-025dba6acfbc",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-01-31T11:05:23.326",
    profit: -0.02584,
    barsHeld: 2
  },
  {
    id: "cde48a17-19cd-41d6-99da-6d86d2cec53a",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-01-31T11:11:52.104",
    profit: -0.016812,
    barsHeld: 1
  },
  {
    id: "980024be-cef1-4239-a9bb-3788594996fb",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-01-31T11:21:10.542",
    profit: 0.004092,
    barsHeld: 2
  },
  {
    id: "9cbb16d2-91bc-4e54-a41c-451d4b604404",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-01-31T11:36:16.118",
    profit: -0.010908,
    barsHeld: 3
  },
  {
    id: "c1f3a17c-9c66-4853-8239-55c2dca0f77c",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-01-31T11:47:12.634",
    profit: -0.007013,
    barsHeld: 2
  },
  {
    id: "dcdcd007-80b5-473c-9eac-173d3475c8a5",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-01-31T11:50:31.078",
    profit: -0.02184,
    barsHeld: 1
  },
  {
    id: "2e0dfb2c-a455-4ad2-880c-77a490d1cda0",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-01-31T12:00:22.788",
    profit: -0.01704,
    barsHeld: 2
  },
  {
    id: "189cc348-567b-4277-ada9-59f62b4583ce",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-01-31T12:33:36.15",
    profit: 0.051154,
    barsHeld: 6
  },
  {
    id: "5a3d77ef-0904-4917-a509-36bc936995c9",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-01-31T12:40:08.47",
    profit: -0.007046,
    barsHeld: 2
  },
  {
    id: "bd6d2d7d-29d6-409f-b12d-2fb1f760d577",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-01-31T12:53:36.33",
    profit: 0.03376,
    barsHeld: 2
  },
  {
    id: "30b4800b-1da7-4593-9ca2-321b3b74722b",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-01-31T13:00:46.419",
    profit: -0.01304,
    barsHeld: 2
  },
  {
    id: "5099908d-f7fd-49d8-9c7f-88f7a85d02a0",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-01-31T13:10:24.395",
    profit: 0.02956,
    barsHeld: 2
  },
  {
    id: "b0cbb2f8-7ec6-4003-97a8-5ee3b98b1978",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-01-31T13:18:01.581",
    profit: -0.06624,
    barsHeld: 1
  },
  {
    id: "82c831ba-1063-4994-a708-5ced10f83587",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-01-31T13:21:40.478",
    profit: -0.01724,
    barsHeld: 1
  },
  {
    id: "19d41eb3-29d3-40ea-9408-c55fd48273fe",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-01-31T13:57:59.698",
    profit: 0.09576,
    barsHeld: 7
  },
  {
    id: "f19787b4-e68f-4dd0-9e3e-5e548b4026fb",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-01-31T14:08:44.565",
    profit: 0.00436,
    barsHeld: 2
  },
  {
    id: "77d23d16-096d-4d8f-849f-9bcc770048f3",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-01-31T14:16:21.388",
    profit: -0.001931,
    barsHeld: 2
  },
  {
    id: "a13df1e9-4beb-488c-acf8-4276858790aa",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-01-31T14:51:27.644",
    profit: 0.068469,
    barsHeld: 7
  },
  {
    id: "b133a031-8432-4231-afbf-8cfd79b3c713",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-01-31T16:10:05.282",
    profit: 0.15036,
    barsHeld: 16
  },
  {
    id: "5c22d513-a957-4d64-b8ed-7b0d0dbb5f78",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-01-31T16:32:33.348",
    profit: 0.00932,
    barsHeld: 4
  },
  {
    id: "fe7d6943-f112-4144-a8a7-dc51ae9d4ce3",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-01-31T16:37:36.914",
    profit: -0.01648,
    barsHeld: 1
  },
  {
    id: "038518ab-41e5-4145-95ad-965fde24d3f9",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-01-31T17:03:32.646",
    profit: 0.04158,
    barsHeld: 5
  },
  {
    id: "201dfb8a-c601-428f-8004-9a403d83dc11",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-01-31T17:31:43.03",
    profit: 0.00518,
    barsHeld: 6
  },
  {
    id: "b34c2319-6dc9-4d02-a040-b79e1f9f4c1f",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-01-31T18:05:14.689",
    profit: 0.0186,
    barsHeld: 7
  },
  {
    id: "571802bd-8d13-4e22-8db6-30dd5885273d",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-01-31T18:36:42.609",
    profit: 0.0516,
    barsHeld: 6
  },
  {
    id: "7118fc3f-6378-4460-b6ba-f2360c26f00f",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-01-31T18:48:53.569",
    profit: -0.00744,
    barsHeld: 2
  },
  {
    id: "72d62734-32dc-424c-981f-faa743531394",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-01-31T19:01:19.544",
    profit: 0.00656,
    barsHeld: 3
  },
  {
    id: "a834221e-9e51-4bb0-89c7-5baa0ff317ac",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-01-31T19:14:30.416",
    profit: -0.01304,
    barsHeld: 2
  },
  {
    id: "1315bc93-ea39-40aa-8ef9-1f6ee9672976",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-01-31T19:20:42.334",
    profit: 0.00196,
    barsHeld: 2
  },
  {
    id: "219088e9-548a-4514-9ef6-067d4822d62a",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-01-31T20:03:33.986",
    profit: 0.01016,
    barsHeld: 8
  },
  {
    id: "02ca48e0-947b-4168-9f26-1e417fff84bb",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-01-31T20:27:28.016",
    profit: 0.03976,
    barsHeld: 5
  },
  {
    id: "7551b795-e969-44ae-bef5-76461ba446be",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-01-31T20:59:55.503",
    profit: 0.01236,
    barsHeld: 6
  },
  {
    id: "3f6b80af-ce6b-4f1a-98b6-0d187eab3e46",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-01-31T22:54:57.342",
    profit: 0.15556,
    barsHeld: 23
  },
  {
    id: "21ccedd5-4312-43a3-94e7-d97dbe71a9fa",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-01-31T23:12:59.074",
    profit: -0.024889,
    barsHeld: 4
  },
  {
    id: "49c93028-a680-43bf-a008-4cdc5aea1c9a",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-01-31T23:22:06.388",
    profit: -0.013889,
    barsHeld: 2
  },
  {
    id: "f4cb12a7-7dfc-4a0d-b95d-e8155446c162",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-01-31T23:36:49.274",
    profit: 0.015402,
    barsHeld: 3
  },
  {
    id: "2832200c-5ec5-4e65-851b-a7f98ab5d131",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-01-31T23:47:03.903",
    profit: -0.053398,
    barsHeld: 2
  },
  {
    id: "a6797f06-af31-4397-a54f-0672e9907729",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-02-01T00:13:25.133",
    profit: 0.01156,
    barsHeld: 5
  },
  {
    id: "ea9af85c-a1e0-45c3-bec6-dcd120c68de3",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-02-01T01:33:29.485",
    profit: 0.05816,
    barsHeld: 16
  },
  {
    id: "d8ae111c-606c-4c27-9739-ed6934a08224",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-02-01T01:55:03.203",
    profit: -0.02144,
    barsHeld: 5
  },
  {
    id: "8d08c00f-f415-4592-ae3a-9a2ae400b821",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-02-01T02:23:38.688",
    profit: 0.06976,
    barsHeld: 5
  },
  {
    id: "3904bdd3-93ed-40b6-ad91-cbed0280d92e",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-02-01T02:33:11.189",
    profit: -0.01244,
    barsHeld: 2
  },
  {
    id: "3b1b6a55-8dbc-4441-93de-daa863a7b00e",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-02-01T02:40:37.601",
    profit: 0.00476,
    barsHeld: 2
  },
  {
    id: "5fbc1265-20f3-481d-b6a0-8417678e7ddc",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-02-01T03:00:19.291",
    profit: 0.01976,
    barsHeld: 4
  },
  {
    id: "1bdf456c-bf73-483c-9a29-97177cfa361a",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-02-01T03:10:02.228",
    profit: -0.00604,
    barsHeld: 2
  },
  {
    id: "982d0986-d045-450a-ac98-f22d40add8d0",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-02-01T03:30:38",
    profit: -0.00304,
    barsHeld: 4
  },
  {
    id: "7beab001-bfe4-48bf-abef-4b3f3bc0ede1",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-02-01T03:37:12.421",
    profit: -0.03704,
    barsHeld: 1
  },
  {
    id: "40e441d1-71ad-4917-8130-a5fbb41b3cb2",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-02-01T04:00:19.506",
    profit: -0.02204,
    barsHeld: 5
  },
  {
    id: "48ab9c68-8927-42d8-95ce-53b79f63a6b3",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-02-01T04:47:36.393",
    profit: -0.00264,
    barsHeld: 9
  },
  {
    id: "cd85339a-77cd-4997-9ce6-a849c4102d5f",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-02-01T05:28:09.411",
    profit: 0.02476,
    barsHeld: 8
  },
  {
    id: "a4be63bd-1d74-47b6-beff-235367121934",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-02-01T05:53:42.392",
    profit: -0.01364,
    barsHeld: 5
  },
  {
    id: "71394981-90aa-4fc7-9879-237357aeb3cb",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-02-01T06:28:35.52",
    profit: 0.03676,
    barsHeld: 7
  },
  {
    id: "ec033afa-cddf-48a9-9539-8dab4d462e33",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-02-01T06:52:05.18",
    profit: 0.02056,
    barsHeld: 5
  },
  {
    id: "1646e3f0-3588-4545-91c1-42bf178fabb0",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-02-01T07:05:06.573",
    profit: -0.013341,
    barsHeld: 3
  },
  {
    id: "18077c47-6509-41ae-915a-56a299fd4aea",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-02-01T07:44:34.353",
    profit: 0.060459,
    barsHeld: 7
  },
  {
    id: "25039e85-0c26-44de-b3d4-0a5da361e8b3",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-02-01T08:47:24.964",
    profit: 0.085976,
    barsHeld: 13
  },
  {
    id: "aed6e228-2e28-4b4f-95c5-388699870f57",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-02-01T09:02:58.028",
    profit: -0.006024,
    barsHeld: 3
  },
  {
    id: "ddfa1924-ad03-413c-bc7b-8f0a95aeed78",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-02-01T09:22:12.165",
    profit: 0.03016,
    barsHeld: 4
  },
  {
    id: "dae2542c-528a-42fd-ab9b-7461695250a3",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-02-01T10:16:15.317",
    profit: 0.06356,
    barsHeld: 11
  },
  {
    id: "6b3f4b46-7a77-430b-98fa-5cd7854fa3ed",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-02-01T10:46:50.211",
    profit: 0.04236,
    barsHeld: 6
  },
  {
    id: "8cc2eedb-600a-47f4-bc64-740cfc058d46",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-02-01T11:12:55.131",
    profit: -0.01464,
    barsHeld: 5
  },
  {
    id: "98285893-0e6c-46bf-9479-6064d5a2f595",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-02-01T11:41:57.668",
    profit: 0.04976,
    barsHeld: 6
  },
  {
    id: "b469562d-f67b-44f2-bbc5-272e854b8202",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-02-01T11:47:44.337",
    profit: -0.01584,
    barsHeld: 1
  },
  {
    id: "3df65f0f-4782-4d93-9ca3-f6da5711c4d0",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-02-01T11:59:31.959",
    profit: -0.01284,
    barsHeld: 2
  },
  {
    id: "cf394100-bfa5-4cc2-a0c9-04a9e85fc88e",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-02-01T12:22:17.543",
    profit: -0.02004,
    barsHeld: 5
  },
  {
    id: "ab9f1068-42cb-4c50-91d6-8f8fa0fdccee",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-02-01T13:02:01.724",
    profit: 0.06456,
    barsHeld: 8
  },
  {
    id: "68c13859-22d7-4fb4-8281-4a5776546417",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-02-01T13:33:20.582",
    profit: 0.09236,
    barsHeld: 6
  },
  {
    id: "0be69c9e-d6d2-4430-8ab1-e2436094133c",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-02-01T13:51:37.253",
    profit: -0.01204,
    barsHeld: 4
  },
  {
    id: "723dcbcf-ace4-4c27-a305-c11f724175b2",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-02-01T14:00:18.613",
    profit: -0.02064,
    barsHeld: 2
  },
  {
    id: "ed5c25e4-003b-4979-8c59-f59f20461bcf",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-02-01T14:21:08.099",
    profit: 0.03916,
    barsHeld: 4
  },
  {
    id: "b4306f2f-0239-4088-bfed-675eb989127a",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-02-01T14:32:23.612",
    profit: -0.01984,
    barsHeld: 2
  },
  {
    id: "ccad9bc0-b687-478a-aa7e-6b528ec70513",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-02-01T14:45:02.23",
    profit: -0.00844,
    barsHeld: 3
  },
  {
    id: "ef862324-02fb-4d69-9207-2d176cd99c31",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-02-01T15:01:40.496",
    profit: 0.04476,
    barsHeld: 3
  },
  {
    id: "2eec886b-33e4-44a6-8554-f133abcf488f",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-02-01T15:13:56.328",
    profit: -0.02464,
    barsHeld: 2
  },
  {
    id: "6cdc0289-7b58-441d-8452-a9143d9069ad",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-02-01T15:43:44.435",
    profit: 0.01136,
    barsHeld: 6
  },
  {
    id: "6cd07162-601d-496a-a837-278ccf6dafda",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-02-01T16:26:16.04",
    profit: 0.03616,
    barsHeld: 9
  },
  {
    id: "6d1be451-edad-4504-bab4-24e0b2b1e4d9",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-02-01T17:02:56.431",
    profit: 0.09216,
    barsHeld: 7
  },
  {
    id: "bf937a1d-c568-4ea8-b939-ef198e83f40c",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-02-01T17:12:05.175",
    profit: 0.00336,
    barsHeld: 2
  },
  {
    id: "4cb7676b-5224-4c28-b0af-0c964bb8747e",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-02-01T17:35:29.328",
    profit: 0.05016,
    barsHeld: 5
  },
  {
    id: "319af2aa-751f-4448-bc9a-27a46a1719d9",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-02-01T18:05:15.867",
    profit: 0.04396,
    barsHeld: 6
  },
  {
    id: "ab558528-1503-4b63-aaac-5ea205636b19",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-02-01T18:36:13.171",
    profit: -0.00804,
    barsHeld: 6
  },
  {
    id: "244d6408-da8a-46f7-9a9e-99441d9885a8",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-02-01T18:59:28.053",
    profit: 0.00476,
    barsHeld: 4
  },
  {
    id: "e9c3d5d3-6677-42ca-80c7-96488c5b3530",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-02-01T19:20:25.755",
    profit: -0.01544,
    barsHeld: 5
  },
  {
    id: "53cf4f5b-6e71-4582-9a96-e6b632ebd300",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-02-01T20:16:26.272",
    profit: 0.03156,
    barsHeld: 11
  },
  {
    id: "6bb43078-94b3-45c0-b21b-725d17fd741a",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-02-01T21:44:17.025",
    profit: 0.03176,
    barsHeld: 17
  },
  {
    id: "eece84eb-cfa5-4dbd-b5ae-ff40a0782aeb",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-02-01T22:01:37.304",
    profit: 0.00636,
    barsHeld: 4
  },
  {
    id: "4dbdefba-591b-4cf5-8343-62a0718adf31",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-02-01T22:22:23.612",
    profit: 0.03936,
    barsHeld: 4
  },
  {
    id: "9d9c6fbd-3237-4d5f-b33e-0c24cbba594b",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-02-01T22:49:20.237",
    profit: 0.04856,
    barsHeld: 5
  },
  {
    id: "8a10d390-2b71-481e-a50f-d3030894ebf6",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-02-01T23:25:09.738",
    profit: 0.05516,
    barsHeld: 8
  },
  {
    id: "fc20b809-ba49-4edd-9f54-00f042a3d885",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-02-01T23:33:08.6",
    profit: -0.01184,
    barsHeld: 1
  },
  {
    id: "90905a83-62fd-43dd-acac-015072fd7d21",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-02-01T23:35:06.316",
    profit: -0.039684,
    barsHeld: 1
  },
  {
    id: "fce96109-5c4c-4d8a-9ff0-c3607e2b9c6f",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-02-01T23:50:12.537",
    profit: -0.027284,
    barsHeld: 3
  },
  {
    id: "1edade9d-d941-47d0-b079-183389c3a940",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-02-02T00:01:00.292",
    profit: -0.02684,
    barsHeld: 2
  },
  {
    id: "805faf7a-5de4-4c11-a5b5-58fe0f94c472",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-02-02T00:45:10.836",
    profit: 0.06536,
    barsHeld: 9
  },
  {
    id: "a8ce942f-35f8-4466-8715-816f6fe8491b",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-02-02T00:51:28.177",
    profit: -0.02724,
    barsHeld: 1
  },
  {
    id: "1f56af1b-ebe5-40ed-b35f-443ee74746f7",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-02-02T01:03:13.022",
    profit: 0.00956,
    barsHeld: 2
  },
  {
    id: "8c6bb40e-4b3c-4a91-8d35-ac8f723194e4",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-02-02T01:15:59.82",
    profit: -0.01044,
    barsHeld: 3
  },
  {
    id: "bcac81e0-1525-40de-a3b3-d97b8a7a121f",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-02-02T01:25:42.417",
    profit: 0.02516,
    barsHeld: 2
  },
  {
    id: "5d4feba9-80a8-48e1-b4a6-1db0bdaba547",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-02-02T01:41:48.242",
    profit: 0.03056,
    barsHeld: 3
  },
  {
    id: "335c1adb-61e5-4801-b5be-a19a06905c56",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-02-02T01:47:19.233",
    profit: -0.00644,
    barsHeld: 1
  },
  {
    id: "eaed1984-e2df-4444-8c52-5d3cd7e87d6c",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-02-02T01:56:59.377",
    profit: -0.00984,
    barsHeld: 2
  },
  {
    id: "6927bccd-b47d-418a-bc0e-2b5fe4b99678",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-02-02T02:41:19.618",
    profit: 0.13676,
    barsHeld: 9
  },
  {
    id: "aced2f9a-af26-4f60-b775-1bbced9442ff",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-02-02T02:59:11.625",
    profit: 0.03836,
    barsHeld: 3
  },
  {
    id: "35f59684-0db6-4609-89dd-14f13105700f",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-02-02T03:04:02.109",
    profit: -0.00024,
    barsHeld: 1
  },
  {
    id: "745af012-4dcf-4aa4-84e5-dcd5b4cc27d8",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-02-02T03:10:02.196",
    profit: -0.00484,
    barsHeld: 2
  },
  {
    id: "52452566-3afe-45dc-a9b1-3f7fff7ebbde",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-02-02T03:18:48.522",
    profit: -0.01264,
    barsHeld: 1
  },
  {
    id: "368e0c5a-5f1c-41af-b16a-63430796423d",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-02-02T03:30:43.026",
    profit: -0.00264,
    barsHeld: 3
  },
  {
    id: "57e82a81-75f6-44bd-9753-2c84b6b2bfcd",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-02-02T04:15:17.575",
    profit: 0.14356,
    barsHeld: 9
  },
  {
    id: "df5498e0-986e-4518-a31e-e69fc586ca4d",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-02-02T04:45:48.06",
    profit: 0.18116,
    barsHeld: 6
  },
  {
    id: "511457f7-da64-4cd9-b5c2-039241e39598",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-02-02T04:50:23.237",
    profit: -0.045445,
    barsHeld: 1
  },
  {
    id: "4c7017b0-879b-4aaf-881f-e943cba3d674",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-02-02T05:04:11.199",
    profit: -0.011246,
    barsHeld: 2
  },
  {
    id: "0b8858f2-8868-458c-93a1-a0e93bde9e02",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-02-02T05:22:18.137",
    profit: -0.00124,
    barsHeld: 4
  },
  {
    id: "83313d75-5539-4d81-b811-442741392e4e",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-02-02T05:33:14.517",
    profit: -0.04184,
    barsHeld: 2
  },
  {
    id: "7eed7fe5-4f8c-49bf-b20d-3ece83bf49be",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-02-02T06:25:42.501",
    profit: -0.037084,
    barsHeld: 11
  },
  {
    id: "c92efb14-87ec-4a5e-b3f5-3db8980d4e1d",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-02-02T07:11:58.683",
    profit: 0.100916,
    barsHeld: 9
  },
  {
    id: "263c8810-4c20-46a8-b78c-4d01675ac47c",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-02-02T07:20:54.256",
    profit: 0.00236,
    barsHeld: 2
  },
  {
    id: "578e0b15-c2fe-4704-bbf8-84363e9d68e7",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-02-02T07:37:16.189",
    profit: 0.00676,
    barsHeld: 3
  },
  {
    id: "9e67a987-c7b7-4157-b6f1-af899bd4d06e",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-02-02T07:40:04.14",
    profit: -0.001638,
    barsHeld: 1
  },
  {
    id: "fe3c3bae-4642-4b29-bc2c-7f7b053707d7",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-02-02T07:52:35.092",
    profit: 0.005762,
    barsHeld: 2
  },
  {
    id: "76354f6b-05f4-41f3-b3f1-0365b552ed2b",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-02-02T08:00:22.581",
    profit: -0.00604,
    barsHeld: 2
  },
  {
    id: "f8a7e911-87d4-4d49-b8a9-d8eff1fbf192",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-02-02T08:05:02.427",
    profit: -0.00924,
    barsHeld: 1
  },
  {
    id: "fb0c7d26-227a-4fd1-a37b-28dbaaee090b",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-02-02T08:37:39.11",
    profit: 0.00956,
    barsHeld: 6
  },
  {
    id: "49d39417-a171-47de-9357-ba314a2e9be8",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-02-02T08:53:46.431",
    profit: -0.00524,
    barsHeld: 3
  },
  {
    id: "868ecca8-6b63-4185-a6ce-dcf057b5b256",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-02-02T09:20:21.528",
    profit: -0.01664,
    barsHeld: 6
  },
  {
    id: "b145e05b-9137-4cf5-9d64-e1fa1201b2e9",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-02-02T09:27:34.217",
    profit: -0.02524,
    barsHeld: 1
  },
  {
    id: "5e632f3b-5eb1-4f9f-8a76-521fc294925a",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-02-02T09:40:22.594",
    profit: -0.01144,
    barsHeld: 3
  },
  {
    id: "d92d4b66-39b1-4bea-810a-b1eee60ac202",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-02-02T10:21:45.336",
    profit: 0.09656,
    barsHeld: 8
  },
  {
    id: "1566e1be-560e-4fcd-bb11-b81cf1ef2e46",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-02-02T10:26:56.293",
    profit: -0.02164,
    barsHeld: 1
  },
  {
    id: "7c86571a-c56e-43f0-b3ae-0df21b15b5a5",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-02-02T10:51:18.416",
    profit: 0.04296,
    barsHeld: 5
  },
  {
    id: "18d8e90d-3de6-469c-9512-7df02078bea1",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-02-02T11:03:24.08",
    profit: 0.02496,
    barsHeld: 2
  },
  {
    id: "e277b01d-a668-4937-bb0f-304b54d38417",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-02-02T11:08:57.144",
    profit: -0.00424,
    barsHeld: 1
  },
  {
    id: "d4265722-00c7-4593-987c-c56fc0e9afea",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-02-02T11:21:49.511",
    profit: 0.01276,
    barsHeld: 3
  },
  {
    id: "2daefef0-c830-4208-996d-c5314838b0fc",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-02-02T11:32:00.455",
    profit: 0.01596,
    barsHeld: 2
  },
  {
    id: "0fdef76f-daae-469b-8da3-b484a25a2fce",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-02-02T11:41:43.231",
    profit: -0.00024,
    barsHeld: 2
  },
  {
    id: "7457b07c-e5b5-469d-bbed-2e8c9bd32940",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-02-02T12:25:21.128",
    profit: 0.07756,
    barsHeld: 9
  },
  {
    id: "791d93d2-7442-4eba-94ea-736778d94030",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-02-02T12:40:07.27",
    profit: 0.07376,
    barsHeld: 3
  },
  {
    id: "cdf57b5b-b156-4d70-82bc-a833f7b3b5ae",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-02-02T12:47:19.108",
    profit: -0.02524,
    barsHeld: 1
  },
  {
    id: "8f721a2e-833b-42b6-ae50-495809864fb8",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-02-02T12:53:48.362",
    profit: -0.00039,
    barsHeld: 1
  },
  {
    id: "ecf38c53-5c63-40fb-beb6-3dd5bc622640",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-02-02T13:01:35.475",
    profit: 0.01638,
    barsHeld: 2
  },
  {
    id: "e04bd3ad-6328-4bbd-bb17-03929b3af7ec",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-02-02T13:14:48.642",
    profit: 0.019708,
    barsHeld: 2
  },
  {
    id: "4a0eb60d-4701-41c3-9472-4b9d45af4c33",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-02-02T13:52:00.551",
    profit: 0.012738,
    barsHeld: 8
  },
  {
    id: "8ff703c5-d5a8-4a03-a8b7-9e191db706d0",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-02-02T14:20:10.112",
    profit: 0.06556,
    barsHeld: 6
  },
  {
    id: "1c17d3e6-ff95-4cb9-bdea-fba83aa3d367",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-02-02T15:05:57.969",
    profit: 0.11216,
    barsHeld: 9
  },
  {
    id: "566272f0-4688-46ff-a440-903563081cfd",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-02-02T15:55:34.521",
    profit: -0.02824,
    barsHeld: 10
  },
  {
    id: "da389a4b-634b-45e5-963c-b5339c0adf60",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-02-02T16:03:23.807",
    profit: -0.03484,
    barsHeld: 1
  },
  {
    id: "be81f0f4-44dc-4658-9eca-d167fc6cb1a1",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-02-02T17:04:06.46",
    profit: -0.01144,
    barsHeld: 12
  },
  {
    id: "2ab33244-0476-409d-a88b-884918869760",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-02-02T17:09:07.324",
    profit: -0.02224,
    barsHeld: 1
  },
  {
    id: "a1663d58-455b-4098-a907-03b0ebc65b1d",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-02-02T17:43:59.11",
    profit: -0.02084,
    barsHeld: 7
  },
  {
    id: "3fe9c584-896d-46fe-9848-47ba3bf367a6",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-02-02T19:00:49.793",
    profit: -0.01864,
    barsHeld: 16
  },
  {
    id: "f5eaf78c-4ebc-4c62-8de4-9d7c58ab8b27",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-02-02T19:17:09.75",
    profit: -0.00644,
    barsHeld: 3
  },
  {
    id: "10974cc7-2544-43a5-8163-d7d327a20a85",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-02-02T19:59:55.541",
    profit: -0.01704,
    barsHeld: 8
  },
  {
    id: "c562a881-bfc4-48c8-a8c7-49515343eb5d",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-02-02T20:25:48.092",
    profit: -0.02044,
    barsHeld: 6
  },
  {
    id: "808e8ea3-d061-470a-b9f5-27ddc297fbb0",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-02-02T20:38:37.126",
    profit: -0.01024,
    barsHeld: 2
  },
  {
    id: "ca8fc256-e39c-4d80-a394-3b9d0d220aeb",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-02-02T20:56:40.495",
    profit: 0.02556,
    barsHeld: 4
  },
  {
    id: "e36430b8-08af-4324-b2e9-cc73fcc02f61",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-02-02T21:11:15.396",
    profit: 0.01416,
    barsHeld: 3
  },
  {
    id: "6b458548-7d8c-46cf-81d3-5d13f4d8c890",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-02-02T21:29:06.555",
    profit: 0.01616,
    barsHeld: 3
  },
  {
    id: "83a982b2-c710-4a00-a284-bbfec083d419",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-02-02T22:01:45.567",
    profit: 0.025823,
    barsHeld: 7
  },
  {
    id: "2182f14e-dae7-4c6e-9a7b-0a374df4af14",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-02-02T22:22:30.39",
    profit: 0.025823,
    barsHeld: 4
  },
  {
    id: "2c890017-c5b2-4965-9df2-130bd89914f2",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-02-02T22:27:27.507",
    profit: -0.01764,
    barsHeld: 1
  },
  {
    id: "7c547004-9539-4d7d-8526-e38202dc79a4",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-02-02T22:48:46.027",
    profit: 0.08436,
    barsHeld: 4
  },
  {
    id: "4799ffad-0417-41dc-be82-db3326565141",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-02-02T23:00:26.062",
    profit: 0.012179,
    barsHeld: 3
  },
  {
    id: "532de6dc-caa2-42f3-acbd-1f72a3415b39",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-02-02T23:08:53.38",
    profit: -0.001821,
    barsHeld: 1
  },
  {
    id: "247e0d8f-c239-4d32-be0e-350303d2ec2b",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-02-02T23:20:34.282",
    profit: -0.02564,
    barsHeld: 3
  },
  {
    id: "b230210e-feaa-4742-b5d9-6aed65b040e5",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-02-02T23:45:32.514",
    profit: 0.03216,
    barsHeld: 5
  },
  {
    id: "8c55525e-61ef-43b5-a8f3-0cba9059156d",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-02-02T23:50:48.024",
    profit: -0.03604,
    barsHeld: 1
  },
  {
    id: "d0216037-48c8-4a70-953e-ab2e99422c0a",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-02-03T00:00:10.623",
    profit: -0.01844,
    barsHeld: 2
  },
  {
    id: "b20ffdab-508a-4eca-82a6-78229d0817e5",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-02-03T00:05:28.637",
    profit: -0.09064,
    barsHeld: 1
  },
  {
    id: "ba403011-fa5f-4932-b506-68d1a83744a3",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-02-03T00:10:33.953",
    profit: -0.02384,
    barsHeld: 1
  },
  {
    id: "94dbd01b-00b7-46bf-adf8-747885594ee0",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-02-03T00:25:26.599",
    profit: 0.06196,
    barsHeld: 3
  },
  {
    id: "76850881-305a-4e37-bc4b-e79440011658",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-02-03T00:35:06.408",
    profit: -0.02684,
    barsHeld: 2
  },
  {
    id: "294a9038-dc2d-4032-b1f3-18054dcc48b3",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-02-03T01:09:15.393",
    profit: 0.08076,
    barsHeld: 6
  },
  {
    id: "b959a21e-6e74-4db2-bf41-a320aa5876a1",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-02-03T01:26:51.777",
    profit: -0.01764,
    barsHeld: 4
  },
  {
    id: "f29f7435-f977-44c5-bc24-36bc680430d3",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-02-03T01:47:42.021",
    profit: 0.29076,
    barsHeld: 4
  },
  {
    id: "6c7df487-482a-4b0c-a3c6-c7a77b624ef4",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-02-03T01:52:12.587",
    profit: -0.02624,
    barsHeld: 1
  },
  {
    id: "8be34b8d-65ea-4c2f-b824-8225cf79f07d",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-02-03T01:58:49.525",
    profit: -0.06944,
    barsHeld: 1
  },
  {
    id: "787045ad-03f0-42f4-81a2-d66632a9bf0b",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-02-03T02:10:25.417",
    profit: 0.27056,
    barsHeld: 3
  },
  {
    id: "bb341bc9-cd86-4390-b1c6-ab253b96356a",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-02-03T02:30:09.724",
    profit: 0.02156,
    barsHeld: 4
  },
  {
    id: "6bb804ed-b884-480e-8faa-1fcc80a857d8",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-02-03T03:08:54.618",
    profit: 0.05756,
    barsHeld: 7
  },
  {
    id: "f184cbef-b97a-4cbc-bbde-aa54ee71f815",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-02-03T03:16:47.159",
    profit: 0.00636,
    barsHeld: 2
  },
  {
    id: "b18603eb-8f63-4018-b622-5dfe3ec447e4",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-02-03T03:38:55.315",
    profit: 0.040036,
    barsHeld: 4
  },
  {
    id: "a97a1624-1bc5-4c9c-90c1-f2fc6a80d7c8",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-02-03T03:52:44.2",
    profit: 0.017636,
    barsHeld: 3
  },
  {
    id: "8ed7deb6-76c0-4b14-ac76-39ddc32bbc6b",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-02-03T04:00:19.116",
    profit: -0.00924,
    barsHeld: 2
  },
  {
    id: "fe45fd86-1dc5-4ad3-a378-483f6ea44bcf",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-02-03T04:13:10.494",
    profit: 0.018072,
    barsHeld: 2
  },
  {
    id: "75f3e1c6-1c3c-4022-aae8-4eb6d0655874",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-02-03T04:35:05.192",
    profit: 0.028472,
    barsHeld: 5
  },
  {
    id: "b2c19059-b440-4782-9555-05ccd750f677",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-02-03T04:50:10.038",
    profit: 0.00476,
    barsHeld: 3
  },
  {
    id: "018d5134-2d8c-4083-bfcd-693435c61f52",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-02-03T05:00:11.56",
    profit: -0.00024,
    barsHeld: 2
  },
  {
    id: "f4a867c7-5c46-444d-baff-10993adfc8f1",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-02-03T05:49:59.402",
    profit: 0.04796,
    barsHeld: 9
  },
  {
    id: "eaeed4fe-f2f7-4e91-986a-17872e09f2b5",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-02-03T06:40:32.327",
    profit: 0.02316,
    barsHeld: 11
  },
  {
    id: "de745851-cf02-45d1-a583-b92ab89b6bea",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-02-03T07:05:07.585",
    profit: -0.00284,
    barsHeld: 5
  },
  {
    id: "6392fb85-f37c-4ced-8671-a9892152f4ac",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-02-03T07:35:04.804",
    profit: 0.05716,
    barsHeld: 6
  },
  {
    id: "118c0e58-589d-49b8-b35a-1e133ef2915f",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-02-03T07:44:41.234",
    profit: -0.000128,
    barsHeld: 1
  },
  {
    id: "3c6390f7-45f9-4009-a015-dcfaf315b5e8",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-02-03T07:58:36.467",
    profit: 0.012472,
    barsHeld: 3
  },
  {
    id: "ecd0b5e9-ba8b-47a2-9a79-6c370d8c729c",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-02-03T08:01:01.121",
    profit: -0.000048,
    barsHeld: 1
  },
  {
    id: "735c6c91-5d43-422b-99a3-249ad8277f97",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-02-03T08:13:36.595",
    profit: 0.017352,
    barsHeld: 2
  },
  {
    id: "e98e4f7b-0bc6-449e-8ba5-f6f56a0a05b6",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-02-03T08:51:53.152",
    profit: 0.057068,
    barsHeld: 8
  },
  {
    id: "eb852d8f-d589-4e73-a8f8-dff6e78ed2a7",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-02-03T09:26:07.153",
    profit: 0.046668,
    barsHeld: 7
  },
  {
    id: "107e690e-5dc4-4214-b0ab-e46564b0adcd",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-02-03T09:50:56.482",
    profit: 0.00676,
    barsHeld: 5
  },
  {
    id: "72349aad-aef9-4180-aa04-4c68e4d598c4",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-02-03T10:14:11.381",
    profit: 0.04696,
    barsHeld: 4
  },
  {
    id: "6b933bbe-3502-4e1f-ad33-fc719e11182d",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-02-03T10:20:06.344",
    profit: -0.02484,
    barsHeld: 2
  },
  {
    id: "2481d7ae-50d8-4e43-b1b2-b5750527ce68",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-02-03T10:30:26.193",
    profit: -0.003089,
    barsHeld: 2
  },
  {
    id: "c4035d78-8704-43ed-bc32-115b1923029d",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-02-03T10:46:31.753",
    profit: 0.012511,
    barsHeld: 3
  },
  {
    id: "4070e4c9-37c8-4591-9128-d6ec64b7f921",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-02-03T11:02:44.774",
    profit: 0.03016,
    barsHeld: 3
  },
  {
    id: "5ab56f5a-15a7-4c37-a2fc-b9cc99fdd74c",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-02-03T11:23:02.03",
    profit: 0.040437,
    barsHeld: 4
  },
  {
    id: "04654877-a38e-4ee0-a114-a748cbba343c",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-02-03T11:26:38.332",
    profit: -0.013763,
    barsHeld: 1
  },
  {
    id: "932d0144-8b5b-4eef-8921-38dc91f633d5",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-02-03T11:50:27.376",
    profit: 0.01496,
    barsHeld: 5
  },
  {
    id: "6f1daa2f-8461-448d-8728-c54c0f99ffb7",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-02-03T12:23:40.141",
    profit: -0.00264,
    barsHeld: 6
  },
  {
    id: "73685b22-539a-4673-8937-d90106c96428",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-02-03T12:50:21.157",
    profit: 0.01356,
    barsHeld: 6
  },
  {
    id: "1a2c58ee-1acd-40e1-b713-53335c74d854",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-02-03T13:53:24.104",
    profit: 0.09856,
    barsHeld: 12
  },
  {
    id: "fae4bedd-619d-489a-bc4f-c826b94f4280",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-02-03T14:05:11.799",
    profit: 0.00416,
    barsHeld: 3
  },
  {
    id: "b6154b28-c2c8-4e57-8cb0-2b45e0052909",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-02-03T14:19:30.055",
    profit: 0.02336,
    barsHeld: 2
  },
  {
    id: "149944e8-d68a-48de-9a23-5c5936f566be",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-02-03T15:03:43.557",
    profit: 0.062176,
    barsHeld: 9
  },
  {
    id: "e954af97-23ec-43c8-a64e-0617258c32e2",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-02-03T15:51:31.14",
    profit: 0.073176,
    barsHeld: 10
  },
  {
    id: "b99c0c2d-f6de-4d44-bf76-57fa2b7e4446",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-02-03T15:55:11.153",
    profit: -0.02104,
    barsHeld: 1
  },
  {
    id: "d5ca748d-8f79-4433-b953-e6a5f2ad1404",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-02-03T16:10:03.629",
    profit: -0.00764,
    barsHeld: 3
  },
  {
    id: "d35baaca-bf4b-4266-87c8-b0119a1cb069",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-02-03T16:23:14.346",
    profit: 0.02996,
    barsHeld: 2
  },
  {
    id: "b851a9a9-df6a-4530-bf75-7c221fe55075",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-02-03T16:32:09.566",
    profit: 0.01396,
    barsHeld: 2
  },
  {
    id: "04328eb1-8bf7-421d-9643-2fbae9508804",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-02-03T16:39:59.259",
    profit: -0.01644,
    barsHeld: 1
  },
  {
    id: "6def0e44-29aa-4fa7-b760-71f47746c646",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-02-03T16:50:56.48",
    profit: 0.02656,
    barsHeld: 3
  },
  {
    id: "f5f40c82-8707-4536-895d-1b44f0af3e85",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-02-03T16:58:56.352",
    profit: -0.02384,
    barsHeld: 1
  },
  {
    id: "751c1e9a-1a66-411a-b7d2-f0f6d2960761",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-02-03T17:06:24.491",
    profit: 0.01396,
    barsHeld: 2
  },
  {
    id: "4e6ef0b2-93ca-4a57-ba18-dafaa97768d3",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-02-03T18:06:15.216",
    profit: 0.05216,
    barsHeld: 12
  },
  {
    id: "01b6fde2-c837-414a-b9c7-6fcd25672428",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-02-03T18:30:04.087",
    profit: 0.02576,
    barsHeld: 5
  },
  {
    id: "a43f99e9-1c9b-4322-89d7-6805b139fcb3",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-02-03T20:10:21.113",
    profit: 0.09176,
    barsHeld: 20
  },
  {
    id: "4aa82dd0-98e7-498b-ae6b-c1e68a93ea2a",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-02-03T20:22:24.393",
    profit: -0.01684,
    barsHeld: 2
  },
  {
    id: "f7bbc9bc-2754-4f8a-a549-e0d3fc8466d8",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-02-03T20:45:12.337",
    profit: 0.01116,
    barsHeld: 5
  },
  {
    id: "849a69e3-9537-4c72-8c06-a47809444692",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-02-03T21:17:14.792",
    profit: 0.05236,
    barsHeld: 6
  },
  {
    id: "773bead0-370b-4efd-8108-69007dd6773d",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-02-03T21:33:39.408",
    profit: -0.00024,
    barsHeld: 3
  },
  {
    id: "0b04430c-c674-4fed-90bd-7ca0ef5b0ce8",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-02-03T22:00:20.385",
    profit: 0.02316,
    barsHeld: 6
  },
  {
    id: "98eb0932-bfa2-46b8-ac33-d0050be0b535",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-02-03T22:20:34.01",
    profit: 0.02396,
    barsHeld: 4
  },
  {
    id: "6a591ca8-60fb-40f1-9a70-b38fcc74583e",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-02-03T22:50:35.868",
    profit: 0.03619,
    barsHeld: 6
  },
  {
    id: "fafdc2d8-1317-4bc7-aabe-3d6fb7e4003e",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-02-03T23:02:18.567",
    profit: -0.01761,
    barsHeld: 2
  },
  {
    id: "0403654e-2434-41d8-b47e-9ba7c0c4fea1",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-02-03T23:22:30.5",
    profit: 0.00156,
    barsHeld: 4
  },
  {
    id: "ccc6ffd4-78ee-49b3-8a2c-97c1738d2b45",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-02-04T00:00:07.082",
    profit: 0.04736,
    barsHeld: 8
  },
  {
    id: "faf3a166-c67f-4d6e-a7a1-f15bf3daf717",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-02-04T00:05:48.146",
    profit: -0.01924,
    barsHeld: 1
  },
  {
    id: "c186ec3e-b1c3-4726-90d0-ef30ea7b903f",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-02-04T00:40:49.403",
    profit: 0.06456,
    barsHeld: 7
  },
  {
    id: "71c86dd5-1b8a-4cd0-9b22-bafeba653c34",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-02-04T01:04:30.628",
    profit: -0.00044,
    barsHeld: 4
  },
  {
    id: "72661170-d3f8-482e-a10e-15ebb09d6ab3",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-02-04T01:12:19.675",
    profit: -0.01684,
    barsHeld: 2
  },
  {
    id: "a07b1e4b-238d-4c87-b55b-863592ba951f",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-02-04T01:58:30.593",
    profit: 0.11556,
    barsHeld: 9
  },
  {
    id: "a8d6edcc-8106-4f1a-ad6c-962a524edcd1",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-02-04T02:12:03.12",
    profit: 0.015634,
    barsHeld: 3
  },
  {
    id: "a140598c-c9d5-483a-bbdc-4ee37023c0f2",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-02-04T02:17:40.398",
    profit: -0.012166,
    barsHeld: 1
  },
  {
    id: "6762ed07-51c5-467d-8fbd-186e03f4c46f",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-02-04T02:22:24.249",
    profit: -0.00124,
    barsHeld: 1
  },
  {
    id: "0f7bfc59-25f6-4541-92a2-ee7712c71938",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-02-04T02:29:35.563",
    profit: -0.01724,
    barsHeld: 1
  },
  {
    id: "9ecd7f3e-9b1a-4696-b845-74ac12d095f4",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-02-04T02:42:32.781",
    profit: -0.01384,
    barsHeld: 3
  },
  {
    id: "05aae31d-a3c5-44d0-b627-e5dcad5f21ac",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-02-04T03:20:52.645",
    profit: 0.028318,
    barsHeld: 8
  },
  {
    id: "5eacde5d-3e97-4acb-917f-a6c58d4988f1",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-02-04T03:47:52.741",
    profit: 0.018718,
    barsHeld: 5
  },
  {
    id: "d1a952b4-5ddf-42f1-9fe3-6a9464f5cf51",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-02-04T04:08:58.129",
    profit: -0.00884,
    barsHeld: 4
  },
  {
    id: "78f06a03-8294-4fb6-b5ab-a4552913812e",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-02-04T04:32:29.116",
    profit: 0.02676,
    barsHeld: 5
  },
  {
    id: "5cf4c3e8-09ea-4cb4-85d6-e2b42bfa5f93",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-02-04T04:55:02.296",
    profit: 0.07056,
    barsHeld: 5
  },
  {
    id: "fa1532c8-1653-47dc-8237-fca28a340bc2",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-02-04T05:02:01.295",
    profit: -0.02144,
    barsHeld: 1
  },
  {
    id: "f140b3fa-ea59-48ec-8f14-c6b8be017968",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-02-04T05:11:43.187",
    profit: -0.00204,
    barsHeld: 2
  },
  {
    id: "811ccfb4-c3dc-4af0-b719-1644516a3d44",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-02-04T05:20:02.724",
    profit: 0.00056,
    barsHeld: 2
  },
  {
    id: "42b8794f-9ca5-49cf-81f8-7e7b5e817b57",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-02-04T05:49:42.645",
    profit: 0.00916,
    barsHeld: 5
  },
  {
    id: "33040351-178c-4fe3-95f1-614fa0b1dbbe",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-02-04T06:20:18.225",
    profit: 0.04196,
    barsHeld: 7
  },
  {
    id: "73629e29-a9e6-49b4-ae4a-35d4eaf37e84",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-02-04T06:53:58.477",
    profit: 0.02836,
    barsHeld: 6
  },
  {
    id: "f2d90e12-7f64-47aa-8d00-73d68a831558",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-02-04T07:49:34.176",
    profit: 0.05196,
    barsHeld: 11
  },
  {
    id: "d3367ee8-bc2a-42e3-9d55-5cc5b4c099f8",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-02-04T08:19:15.22",
    profit: 0.00776,
    barsHeld: 6
  },
  {
    id: "7d8f6627-b339-487d-bd52-f0ce1b921190",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-02-04T08:26:13.645",
    profit: -0.02584,
    barsHeld: 2
  },
  {
    id: "1f083ba2-69f0-4b4e-bb5e-d41ff998d7e1",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-02-04T09:02:30.587",
    profit: 0.028954,
    barsHeld: 7
  },
  {
    id: "78f0fed7-04d0-43cc-89d1-5b5de20ec008",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-02-04T09:08:05.996",
    profit: -0.042846,
    barsHeld: 1
  },
  {
    id: "c3b1cd54-b0fb-4a53-8686-fe2eef20e31a",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-02-04T09:43:34.264",
    profit: 0.057473,
    barsHeld: 7
  },
  {
    id: "23752098-7771-4f40-a0a0-8a19799bbae5",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-02-04T09:45:02.033",
    profit: -0.010127,
    barsHeld: 1
  },
  {
    id: "22f30505-1388-4053-a615-a7cd786e879f",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-02-04T10:14:14.47",
    profit: 0.04176,
    barsHeld: 5
  },
  {
    id: "8ed41ea9-2ae6-4f88-b47c-95ed3c947d2c",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-02-04T10:23:07.505",
    profit: 0.00556,
    barsHeld: 2
  },
  {
    id: "a9d2320e-a5c9-4589-b754-e9e291ca9efa",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-02-04T10:41:02.275",
    profit: 0.02076,
    barsHeld: 4
  },
  {
    id: "c62a3941-210b-4e99-aab2-47bec6107d0c",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-02-04T10:45:04.228",
    profit: -0.00444,
    barsHeld: 1
  },
  {
    id: "b9ca94b4-7637-444b-994d-7447102e7df2",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-02-04T10:50:07.122",
    profit: -0.03944,
    barsHeld: 1
  },
  {
    id: "963ccd8b-7c09-4c8f-943f-1f47d4bb7a43",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-02-04T10:56:29.796",
    profit: -0.00004,
    barsHeld: 1
  },
  {
    id: "5e201ed9-d7f2-41a1-9e33-d66f2cbc0cc8",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-02-04T11:05:11.694",
    profit: 0.02296,
    barsHeld: 2
  },
  {
    id: "4df762f6-cb7f-43b2-8066-2dede3b5611d",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-02-04T11:20:54.449",
    profit: 0.00976,
    barsHeld: 3
  },
  {
    id: "fb9c6d92-3fb6-408a-b7a1-fe7f82d7ec51",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-02-04T11:29:01.389",
    profit: -0.00264,
    barsHeld: 1
  },
  {
    id: "343a487f-2710-43a0-9dfc-6bf7e3aaea7d",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-02-04T11:44:27.848",
    profit: 0.056737,
    barsHeld: 3
  },
  {
    id: "e2718ecc-7863-47ba-b2a2-28fbb77dce5d",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-02-04T12:20:52.184",
    profit: 0.103537,
    barsHeld: 8
  },
  {
    id: "d9233718-e4f1-4cf5-8d04-11369d1f218f",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-02-04T12:28:40.536",
    profit: -0.00364,
    barsHeld: 1
  },
  {
    id: "f3418f44-bfed-408a-9d13-ea8d18c27a15",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-02-04T12:46:21.085",
    profit: 0.04678,
    barsHeld: 4
  },
  {
    id: "fe3e845f-fd84-45a1-bb49-a5ede3760b1d",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-02-04T12:54:28.495",
    profit: -0.02942,
    barsHeld: 1
  },
  {
    id: "7b740d88-f930-44ae-a00c-9da984b3cecf",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-02-04T13:00:04.494",
    profit: -0.02204,
    barsHeld: 2
  },
  {
    id: "67d7c574-23d6-47ac-9156-740b1a3df5e9",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-02-04T13:14:07.858",
    profit: -0.00924,
    barsHeld: 2
  },
  {
    id: "b84b58d4-12a8-43cc-847d-a7618e7aa8cf",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-02-04T13:24:52.483",
    profit: 0.01616,
    barsHeld: 2
  },
  {
    id: "6ce4b4df-66fc-470e-a942-3b700a53f387",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-02-04T13:49:18.222",
    profit: 0.02016,
    barsHeld: 5
  },
  {
    id: "b8b41743-c74e-480e-881c-4857132e48c8",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-02-04T13:52:24.18",
    profit: -0.00024,
    barsHeld: 1
  },
  {
    id: "a137b262-e3f4-4069-a48b-ed5825f352f7",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-02-04T14:00:52.452",
    profit: 0.02176,
    barsHeld: 2
  },
  {
    id: "2791083b-6ed5-4118-bb08-d6d9891a2027",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-02-04T14:09:31.166",
    profit: -0.02904,
    barsHeld: 1
  },
  {
    id: "fcc92c10-6ea5-42a5-86f8-fc53139553b0",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-02-04T14:18:14.52",
    profit: -0.01444,
    barsHeld: 2
  },
  {
    id: "e9b7ece8-7cde-41ec-b0f8-537bbe47927f",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-02-04T14:56:14.396",
    profit: 0.01656,
    barsHeld: 8
  },
  {
    id: "cfead377-0646-44b2-b2fa-fa10512deaae",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-02-04T15:21:00.193",
    profit: 0.13236,
    barsHeld: 5
  },
  {
    id: "f6b9f7ac-ec7a-476b-a1a2-a55838cddeac",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-02-04T15:44:13.495",
    profit: 0.03416,
    barsHeld: 4
  },
  {
    id: "7f353432-94cb-43bf-8727-a8dcf773ffb0",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-02-04T16:01:13.17",
    profit: 0.01696,
    barsHeld: 4
  },
  {
    id: "2792bf40-7013-46b4-a23c-21b3917f2ab2",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-02-04T16:19:28.051",
    profit: -0.02724,
    barsHeld: 3
  },
  {
    id: "aaa475c9-f854-4219-88a7-b26698c1d074",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-02-04T16:35:15.162",
    profit: 0.03796,
    barsHeld: 4
  },
  {
    id: "e525d531-a715-45c8-889b-2fe957154bbc",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-02-04T16:45:11.049",
    profit: 0.04236,
    barsHeld: 2
  },
  {
    id: "7b3c72d0-803a-43f2-bfb1-e866757450bd",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-02-04T16:51:40.23",
    profit: -0.006481,
    barsHeld: 1
  },
  {
    id: "a5e394c8-129f-4c4a-9add-546d8864008f",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-02-04T16:58:05.59",
    profit: -0.013481,
    barsHeld: 1
  },
  {
    id: "b3a466ad-d7cc-45cc-901d-5a87160ba204",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-02-04T17:11:01.044",
    profit: -0.01424,
    barsHeld: 3
  },
  {
    id: "30eeb71e-6758-4df3-b28e-6fdbfd52cb82",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-02-04T17:52:45.923",
    profit: 0.00216,
    barsHeld: 8
  },
  {
    id: "e8f6d3c9-9f2e-4b2f-b096-6f73a18a434e",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-02-04T18:16:32.568",
    profit: 0.03116,
    barsHeld: 5
  },
  {
    id: "5f6470a3-422c-4651-9966-d7e9744d3d21",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-02-04T18:35:14.654",
    profit: 0.01956,
    barsHeld: 4
  },
  {
    id: "9005762b-9ed0-4056-a3de-7956213f9d20",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-02-04T18:45:32.283",
    profit: -0.019926,
    barsHeld: 2
  },
  {
    id: "7b98565f-19ee-48d4-ba51-b8aba34edf3c",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-02-04T19:00:28.927",
    profit: 0.025674,
    barsHeld: 3
  },
  {
    id: "c30eba11-4a58-4740-b217-091520f56824",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-02-04T19:10:24.413",
    profit: -0.00624,
    barsHeld: 2
  },
  {
    id: "4cd039a3-120b-4d31-9531-675b87dfc7ce",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-02-04T19:25:43.163",
    profit: 0.01316,
    barsHeld: 3
  },
  {
    id: "27483d8e-b50c-4fb4-88c4-b4a35be487d1",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-02-04T19:36:19.609",
    profit: -0.01144,
    barsHeld: 2
  },
  {
    id: "20df2c03-884a-40e6-9275-e6b52395fe5e",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-02-04T19:41:26.18",
    profit: -0.02124,
    barsHeld: 1
  },
  {
    id: "034a2f38-65d8-49e4-856d-81c73abb3731",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-02-04T20:05:02.325",
    profit: -0.02264,
    barsHeld: 5
  },
  {
    id: "efa7ea83-4ebe-4f88-9350-d50fd1409562",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-02-04T20:25:54.346",
    profit: 0.02336,
    barsHeld: 4
  },
  {
    id: "cfcdc5f7-b0b6-453c-9585-aeb32a65b42c",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-02-04T21:09:07.103",
    profit: 0.05016,
    barsHeld: 8
  },
  {
    id: "a6f4da79-2c53-416d-bbda-d67cadaf217e",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-02-04T21:33:19.563",
    profit: -0.01244,
    barsHeld: 5
  },
  {
    id: "3f8523fc-4600-443c-97d2-8a96bb645494",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-02-04T21:43:01.904",
    profit: -0.031262,
    barsHeld: 2
  },
  {
    id: "55bc30f0-b9da-4b91-84d1-1c8a9cfffc05",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-02-04T22:16:31.256",
    profit: 0.017738,
    barsHeld: 7
  },
  {
    id: "3a4003ae-3d23-4f2c-93d0-a00bfaec51fa",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-02-04T23:10:32.864",
    profit: 0.05296,
    barsHeld: 11
  },
  {
    id: "706084c0-b65a-4144-9d51-0c497b2d4c92",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-02-04T23:35:57.402",
    profit: 0.01356,
    barsHeld: 5
  },
  {
    id: "358dcbad-dff5-4b79-9194-2ea761622454",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-02-05T00:01:09.368",
    profit: 0.00176,
    barsHeld: 5
  },
  {
    id: "3ebaa019-6f40-42d3-adcb-b35ce8392f75",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-02-05T00:14:42.229",
    profit: -0.01384,
    barsHeld: 2
  },
  {
    id: "130c7f85-e1d8-4fd7-9c4c-165f04d6dca8",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-02-05T00:58:34.349",
    profit: 0.04176,
    barsHeld: 9
  },
  {
    id: "eb93cb86-8ca2-4059-93e0-55644d8f35ba",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-02-05T01:01:20.119",
    profit: -0.03304,
    barsHeld: 1
  },
  {
    id: "a136c654-ba8b-4bf9-9bfa-0122e1e586ff",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-02-05T01:10:32.179",
    profit: -0.01564,
    barsHeld: 2
  },
  {
    id: "d7b70763-6840-4fcd-a009-61cd43dbfe87",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-02-05T01:44:15.362",
    profit: 0.03816,
    barsHeld: 6
  },
  {
    id: "cf2a093b-bc22-4f8a-b53e-f924caee368d",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-02-05T01:58:26.43",
    profit: -0.026527,
    barsHeld: 3
  },
  {
    id: "6a906580-8f27-4ec9-8cbf-b0a33ff36512",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-02-05T02:24:34.52",
    profit: 0.025473,
    barsHeld: 5
  },
  {
    id: "003746bc-93e8-4b0f-aa9e-4bb8fefc5771",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-02-05T02:35:20.373",
    profit: 0.008296,
    barsHeld: 3
  },
  {
    id: "94cac718-6388-4d6d-a54c-01e429277190",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-02-05T02:43:34.51",
    profit: -0.00004,
    barsHeld: 1
  },
  {
    id: "0f3ee6c9-70e5-4270-9733-6b862b6fe694",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-02-05T03:05:40.555",
    profit: 0.046622,
    barsHeld: 5
  },
  {
    id: "c8641c96-a555-4a1e-b370-21e0c616f56a",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-02-05T03:46:07.293",
    profit: -0.004438,
    barsHeld: 8
  },
  {
    id: "c4c1ef4d-868e-4e04-a3e6-9c425c368489",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-02-05T04:12:04.167",
    profit: 0.04019,
    barsHeld: 5
  },
  {
    id: "45378926-1187-436b-8a4e-180a4b83e8d5",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-02-05T04:44:03.268",
    profit: 0.013786,
    barsHeld: 6
  },
  {
    id: "b4e32bc7-d8b2-4111-a4fd-1b6a996f5726",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-02-05T05:12:52.225",
    profit: 0.03196,
    barsHeld: 6
  },
  {
    id: "dedb5a90-eeb9-448c-84a7-0076e6318334",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-02-05T05:35:02.451",
    profit: 0.01096,
    barsHeld: 5
  },
  {
    id: "fe6dec91-cce1-4325-9382-83e923eeb954",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-02-05T06:35:18.199",
    profit: 0.10396,
    barsHeld: 12
  },
  {
    id: "209092e0-8de6-4691-9b59-d85db57224b2",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-02-05T06:46:15.924",
    profit: 0.00776,
    barsHeld: 2
  },
  {
    id: "6193a241-c84f-4544-82b4-02aa4cd57b20",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-02-05T06:50:07.557",
    profit: -0.01784,
    barsHeld: 1
  },
  {
    id: "f95e22f8-dda3-44cf-8e40-2f36ddc8a231",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-02-05T07:20:51.248",
    profit: 0.01536,
    barsHeld: 6
  },
  {
    id: "6a1b6bbb-cac4-4cc0-bd14-14fb42ff4869",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-02-05T07:33:26.675",
    profit: 0.033561,
    barsHeld: 2
  },
  {
    id: "73615650-ec69-4b9a-adce-1fa90de7523d",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-02-05T07:56:14.525",
    profit: 0.032361,
    barsHeld: 5
  },
  {
    id: "f43c3251-a024-4f1b-ad7e-23c850047a59",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-02-05T08:07:09.337",
    profit: -0.02784,
    barsHeld: 2
  },
  {
    id: "fc26b108-3a7c-4cad-8927-d6aa73011c69",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-02-05T08:40:33.099",
    profit: 0.03856,
    barsHeld: 7
  },
  {
    id: "c551fd68-5b60-4b2e-b995-24e18d9de510",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-02-05T08:53:45.715",
    profit: 0.00316,
    barsHeld: 2
  },
  {
    id: "29ed795b-7566-49b9-bc65-e0a94993dc25",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-02-05T08:57:10.457",
    profit: -0.01804,
    barsHeld: 1
  },
  {
    id: "23677730-767c-4718-be6a-d08b3dca6afd",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-02-05T09:10:02.386",
    profit: 0.00656,
    barsHeld: 3
  },
  {
    id: "b5782229-dba9-43aa-8cd6-0847a0e69cd9",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-02-05T09:23:37.108",
    profit: -0.00324,
    barsHeld: 2
  },
  {
    id: "175813e8-2ec8-44f3-888a-a5fa5dd03605",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-02-05T10:00:04.614",
    profit: 0.00996,
    barsHeld: 8
  },
  {
    id: "75285ced-d7f4-4b65-827b-454dabc99791",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-02-05T10:20:30.361",
    profit: -0.00624,
    barsHeld: 4
  },
  {
    id: "3a63f885-5835-4acf-add3-0d4d64af054c",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-02-05T10:55:05.168",
    profit: 0.22636,
    barsHeld: 7
  },
  {
    id: "c0f1d320-2564-4925-9d96-a0e50802cc61",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-02-05T11:08:56.702",
    profit: -0.04564,
    barsHeld: 2
  },
  {
    id: "32f48186-0b7e-43b5-9d3c-3c464b8fd3ae",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-02-05T11:20:54.341",
    profit: 0.00976,
    barsHeld: 3
  },
  {
    id: "25770f62-917d-4cf1-8748-eb60fe8a4fb2",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-02-05T11:35:06.374",
    profit: 0.02516,
    barsHeld: 3
  },
  {
    id: "0b5aa449-afbb-4f1e-b4f6-c87ebf7d0b57",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-02-05T11:45:56.332",
    profit: 0.02896,
    barsHeld: 2
  },
  {
    id: "41973e8e-10f7-4df2-8f71-36688b82887e",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-02-05T11:53:22.61",
    profit: -0.02444,
    barsHeld: 1
  },
  {
    id: "7ad843d4-796b-4eee-b620-79cbac67094b",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-02-05T12:24:49.475",
    profit: 0.09796,
    barsHeld: 6
  },
  {
    id: "b8a5bead-7de0-4523-a683-cdf8d73ab314",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-02-05T12:36:54.39",
    profit: 0.01716,
    barsHeld: 3
  },
  {
    id: "f6bedf43-050c-47b8-91e9-cb23888ae701",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-02-05T12:52:06.256",
    profit: 0.00716,
    barsHeld: 3
  },
  {
    id: "0cd722a2-7572-418b-916f-aeaae9e58bf2",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-02-05T12:56:20.762",
    profit: -0.01484,
    barsHeld: 1
  },
  {
    id: "d45a67e3-d392-4a2d-8abd-132df3c21af9",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-02-05T13:00:41.805",
    profit: -0.02124,
    barsHeld: 1
  },
  {
    id: "10ae4084-28b4-4d53-b6d4-58bf774e782d",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-02-05T13:13:16.777",
    profit: -0.02224,
    barsHeld: 2
  },
  {
    id: "4620ac98-e7f7-42f4-9476-b9e149457ff7",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-02-05T13:21:45.224",
    profit: -0.00004,
    barsHeld: 2
  },
  {
    id: "bc5592e2-4cf6-46da-9615-1ee3320b66bb",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-02-05T13:30:14.811",
    profit: 0.00876,
    barsHeld: 2
  },
  {
    id: "0c4076b1-5f19-4177-b4a4-eea675def561",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-02-05T13:35:02.895",
    profit: -0.020291,
    barsHeld: 1
  },
  {
    id: "a9e17e8d-3951-4fea-9ac1-28adb02db383",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-02-05T13:54:15.287",
    profit: 0.012509,
    barsHeld: 3
  },
  {
    id: "05819d19-cea1-4b4a-a96f-b056a88e26cc",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-02-05T14:14:21.051",
    profit: 0.013466,
    barsHeld: 4
  },
  {
    id: "36dfc0ea-aa32-45b5-bc76-e895d62bcff4",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-02-05T14:44:14.346",
    profit: 0.003666,
    barsHeld: 6
  },
  {
    id: "c2a218d4-b53d-4b1a-bae4-6cdff6f9625b",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-02-05T15:07:04.501",
    profit: -0.00724,
    barsHeld: 5
  },
  {
    id: "012e3833-f066-4d27-abf6-90f04df38e3d",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-02-05T15:15:00.451",
    profit: -0.01324,
    barsHeld: 1
  },
  {
    id: "fbf0e91f-a662-43de-96e4-15623f18c79b",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-02-05T16:01:36.117",
    profit: 0.06396,
    barsHeld: 10
  },
  {
    id: "7cc2eefd-9da2-490d-b1ac-fe6ee1657cb9",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-02-05T16:11:19.566",
    profit: -0.05924,
    barsHeld: 2
  },
  {
    id: "a6fccab9-2566-4e83-b034-387454c2a263",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-02-05T16:30:08.119",
    profit: 0.086345,
    barsHeld: 4
  },
  {
    id: "b7edcb8f-44b4-4d61-aa5c-c72fb7b5f9c1",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-02-05T16:38:33.345",
    profit: -0.000855,
    barsHeld: 1
  },
  {
    id: "af708a4c-5b76-4644-b6c7-0e1ee1f4e8c7",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-02-05T16:50:12.093",
    profit: -0.00224,
    barsHeld: 3
  },
  {
    id: "f5b79dcd-1fb8-4cae-b058-9335ca484a8f",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-02-05T16:56:21.13",
    profit: -0.00404,
    barsHeld: 1
  },
  {
    id: "3727fbba-4c5d-4ee6-a805-70ae22f42f08",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-02-05T17:05:26.095",
    profit: 0.00376,
    barsHeld: 2
  },
  {
    id: "19afbdbb-93a0-4075-be65-80466215aaa4",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-02-05T17:10:03.458",
    profit: -0.00724,
    barsHeld: 1
  },
  {
    id: "b4133d4c-b518-4b1d-821a-2d83f1040f5b",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-02-05T17:15:12.146",
    profit: -0.00564,
    barsHeld: 1
  },
  {
    id: "dcd7d06b-1a3c-42d9-b5da-5f955256438e",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-02-05T17:30:25.181",
    profit: 0.001849,
    barsHeld: 3
  },
  {
    id: "a6c23a36-cd77-41fb-9a82-c3ce5c5e2684",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-02-05T17:58:08.225",
    profit: 0.000849,
    barsHeld: 5
  },
  {
    id: "15a7a362-7a59-40ea-9472-e238babd5326",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-02-05T18:04:35.156",
    profit: -0.033364,
    barsHeld: 1
  },
  {
    id: "1e796270-4254-4db0-b614-cca2eb31d3f4",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-02-05T18:25:18.5",
    profit: 0.169436,
    barsHeld: 5
  },
  {
    id: "0cd35776-abc8-4267-aea2-dbd7bf6827ef",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-02-05T18:50:49.232",
    profit: -0.026313,
    barsHeld: 5
  },
  {
    id: "6d9440dd-bd9c-43c9-8c45-a9f4132c28e7",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-02-05T19:41:28.234",
    profit: 0.030487,
    barsHeld: 10
  },
  {
    id: "34d1f314-0c0c-4f75-adc2-9b6738082e4f",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-02-05T20:21:57.884",
    profit: -0.02424,
    barsHeld: 8
  },
  {
    id: "5cf00fa5-aab6-4c02-a963-2de0eb89bc3c",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-02-05T20:40:41.639",
    profit: -0.08144,
    barsHeld: 4
  },
  {
    id: "305bd923-2938-4278-ab8d-e4d73667e00c",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-02-05T21:02:07.158",
    profit: -0.05304,
    barsHeld: 4
  },
  {
    id: "870a630c-0473-4cc2-bbd8-e0c52ca712e6",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-02-05T21:52:08.625",
    profit: 0.01376,
    barsHeld: 10
  },
  {
    id: "a85cc9b4-cf0d-4f86-bc1e-ce5fa8843664",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-02-05T22:20:02.313",
    profit: 0.10416,
    barsHeld: 6
  },
  {
    id: "b59c90c9-dc4c-4283-a3b7-2b156a1a3c9f",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-02-05T22:34:28.66",
    profit: -0.00204,
    barsHeld: 2
  },
  {
    id: "dec866a4-0bd6-45e0-afe8-d7ad00793de4",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-02-05T22:42:03.479",
    profit: 0.005492,
    barsHeld: 2
  },
  {
    id: "de479596-0918-4f8b-9932-9a7d18c6e99f",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-02-05T22:45:27.812",
    profit: -0.038308,
    barsHeld: 1
  },
  {
    id: "e5b8a92a-ca94-4f8e-9df9-dedfd1b092ab",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-02-05T22:55:31.164",
    profit: 0.00616,
    barsHeld: 2
  },
  {
    id: "060b9b35-d011-4dd8-a5fa-e2b4cf1e9201",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-02-05T23:11:47.154",
    profit: 0.04036,
    barsHeld: 3
  },
  {
    id: "1fe79e33-b306-40b9-bd39-94d0c2344988",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-02-05T23:17:44.835",
    profit: -0.00244,
    barsHeld: 1
  },
  {
    id: "5b6e8313-bf05-4d8a-854e-03347b807cc6",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-02-06T00:13:46.362",
    profit: -0.00684,
    barsHeld: 11
  },
  {
    id: "c3fc4676-51d8-438f-b75a-b0f29f603272",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-02-06T00:27:56.567",
    profit: 0.14556,
    barsHeld: 3
  },
  {
    id: "78154e7a-2d64-40b7-8ffa-84c6ce775e36",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-02-06T00:36:48.099",
    profit: 0.01056,
    barsHeld: 2
  },
  {
    id: "fbee32b3-261a-4095-9e23-edb8863b7b3d",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-02-06T00:42:49.476",
    profit: -0.01584,
    barsHeld: 1
  },
  {
    id: "ce7c0bcc-7caf-4f2e-8434-73a70fbf59ab",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-02-06T00:55:09.227",
    profit: -0.05104,
    barsHeld: 3
  },
  {
    id: "5dee2c2c-db52-443b-ae6d-6d2b0849445c",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-02-06T01:03:23.194",
    profit: -0.01804,
    barsHeld: 1
  },
  {
    id: "bbef16d7-20b0-44fd-a5f3-26278731bfee",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-02-06T01:15:22.819",
    profit: 0.03756,
    barsHeld: 3
  },
  {
    id: "b7f88867-e769-405c-a2fe-c7517bef636a",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-02-06T01:20:03.436",
    profit: -0.02264,
    barsHeld: 1
  },
  {
    id: "720be4dd-61eb-42ec-95ac-e8f5c541c49f",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-02-06T02:04:54.239",
    profit: 0.04896,
    barsHeld: 8
  },
  {
    id: "273fe766-a1f6-4069-9d7b-91eb5eea94f7",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-02-06T03:06:23.061",
    profit: 0.05816,
    barsHeld: 13
  },
  {
    id: "5c61b57f-2b46-47fd-8b25-99211e47c836",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-02-06T03:35:41.333",
    profit: 0.01136,
    barsHeld: 6
  },
  {
    id: "3a328781-d576-41a1-a5cb-bd8bcb81b9ae",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-02-06T03:47:36.369",
    profit: -0.03364,
    barsHeld: 2
  },
  {
    id: "0f83db6b-c096-48b1-9bba-6f5040071709",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-02-06T04:40:58.211",
    profit: 0.07456,
    barsHeld: 11
  },
  {
    id: "d40becdc-b01f-4b53-ac72-39000effe064",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-02-06T05:07:08.994",
    profit: -0.01624,
    barsHeld: 5
  },
  {
    id: "5c34d6de-5ecd-4436-8b37-a5d22bfb9edc",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-02-06T05:38:38.256",
    profit: -0.01424,
    barsHeld: 6
  },
  {
    id: "eb5735f8-6a80-4de5-bce6-87bdba3289e5",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-02-06T06:22:36.129",
    profit: 0.04656,
    barsHeld: 9
  },
  {
    id: "3533e422-9875-40fa-a65d-386aeb14229f",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-02-06T06:59:53.556",
    profit: 0.07716,
    barsHeld: 7
  },
  {
    id: "512a8c6e-ff4d-47b4-95f2-1fd8972b7add",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-02-06T07:15:02.557",
    profit: -0.010045,
    barsHeld: 4
  },
  {
    id: "60506543-48f4-41d9-af08-8a4b1ded4d99",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-02-06T07:56:21.162",
    profit: 0.026755,
    barsHeld: 8
  },
  {
    id: "00d53161-d599-443f-b391-2aa9f327e9de",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-02-06T09:32:16.202",
    profit: 0.12076,
    barsHeld: 19
  },
  {
    id: "f8d54fae-6f24-4dec-b7a1-dac8362ef01c",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-02-06T10:22:34.375",
    profit: 0.08376,
    barsHeld: 10
  },
  {
    id: "af0e2e79-dc2c-4e33-9512-cb9fe53c88e5",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-02-06T10:32:38.371",
    profit: -0.00184,
    barsHeld: 2
  },
  {
    id: "f57c0084-326c-45b8-90b1-25f65d027d05",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-02-06T10:50:55.415",
    profit: 0.01796,
    barsHeld: 4
  },
  {
    id: "04dea06b-e51a-4b2c-9d19-d3ad83ea0052",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-02-06T10:55:30.668",
    profit: -0.00004,
    barsHeld: 1
  },
  {
    id: "5f571239-e767-43c4-af71-4be63676c739",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-02-06T11:01:55.969",
    profit: -0.00964,
    barsHeld: 1
  },
  {
    id: "5545f505-7563-40d3-a8ff-a0c990962c09",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-02-06T11:17:51.416",
    profit: 0.00756,
    barsHeld: 3
  },
  {
    id: "491dabef-094a-4b2b-bcdb-820511d9b301",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-02-06T12:32:00.84",
    profit: 0.143979,
    barsHeld: 15
  },
  {
    id: "0ea70d0a-737e-4e4c-a75d-cb3f1b26248a",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-02-06T12:42:56.721",
    profit: -0.047221,
    barsHeld: 2
  },
  {
    id: "25ec4778-510b-45a4-9652-cf9a579059e6",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-02-06T13:16:23.346",
    profit: 0.16556,
    barsHeld: 7
  },
  {
    id: "e133fed1-87d3-4830-be45-a9b4b4dfa845",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-02-06T13:24:54.319",
    profit: -0.01624,
    barsHeld: 1
  },
  {
    id: "98418a66-96dc-49ea-8d0d-ee221ef47202",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-02-06T13:28:42.27",
    profit: -0.04142,
    barsHeld: 1
  },
  {
    id: "1de36cc0-233d-417f-95a6-cec27e3f17c3",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-02-06T13:35:18.374",
    profit: 0.025928,
    barsHeld: 2
  },
  {
    id: "ffb4aaec-30fc-408d-9adf-dfe2dcd8c6ad",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-02-06T13:43:24.604",
    profit: -0.012292,
    barsHeld: 1
  },
  {
    id: "6671fd27-cef5-424f-9757-d59a4e9d1af3",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-02-06T13:55:42.348",
    profit: 0.15616,
    barsHeld: 3
  },
  {
    id: "865d8070-80b9-408b-8440-b39bd7bdd1cd",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-02-06T14:03:21.655",
    profit: -0.04124,
    barsHeld: 1
  },
  {
    id: "c4c61edc-7db0-40ba-9d01-5c6ac99ee788",
    direction: cpz.PositionDirection.short,
    exitDate: "2020-02-06T14:10:24.645",
    profit: -0.01064,
    barsHeld: 2
  },
  {
    id: "644746e4-4b0c-43c2-a1c5-a8b997c4ca8b",
    direction: cpz.PositionDirection.long,
    exitDate: "2020-02-06T14:41:08.034",
    profit: 0.22776,
    barsHeld: 6
  }
];

describe("Test 'tradeStatistics' utils", () => {
  describe("Test 'calcStatistics'", () => {
    it("Should calc stats", () => {
      const result = calcStatistics(positions);
      expect(result).toBeTruthy();
    });
  });
});
