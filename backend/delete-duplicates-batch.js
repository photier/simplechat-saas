// Duplicate workflows to DELETE (keeping the most recent one per bot)

// bot_LJlWQhRZol - KEEP: XPMbvG0wNQv2yn7y (2025-11-20T20:31:16)
const bot_LJlWQhRZol_delete = [
  'hmcV1RMv5G20FqZl',  // 2025-11-20T14:31:17
  'wOUTq4gJPrqfQLky',  // 2025-11-20T12:31:30
  'z1P9c7gZR3FOWHRz',  // 2025-11-20T13:31:16
];

// bot_yjB4Oo3GBj - KEEP: 9pwY99ub6YfwJqah (2025-11-20T20:45:19)
const bot_yjB4Oo3GBj_delete = [
  'UVYqLncz5OvKKc1N',  // 2025-11-20T14:45:17
  'BZzw9w3tC37Kn1E0',  // 2025-11-20T19:45:17
  'cE0f1VQftrxPkmBk',  // 2025-11-20T17:45:17
  'LsWVP4bQNS1Kg9f7',  // 2025-11-20T16:45:17
  'NAfrachIzBLlGiPa',  // 2025-11-20T13:45:17
  'Y4fDxLIdYDOtiozO',  // 2025-11-20T18:45:17
  'MGnV4v2BnCPhQzEP',  // 2025-11-20T15:45:41
];

// bot_qzNBwMJmY9 - KEEP: 6MvPg3C1xQ3o0Xag (2025-11-20T20:17:17)
const bot_qzNBwMJmY9_delete = [
  'xeim4tkVrr1jbEyW',  // 2025-11-20T16:17:16
  'l9ug3O5IFXjGkPbC',  // 2025-11-20T17:17:16
  'DMQTScQf19Zjqnep',  // 2025-11-20T14:17:16
  '0hcBNmbCTtfKSEKf',  // 2025-11-20T13:17:16
  '1INMos4AqvsjiwdU',  // 2025-11-20T15:17:23
  '5h6Eh2d3tHVwt0h2',  // 2025-11-20T12:17:24
  'oa3msy1PkJxQoaSz',  // 2025-11-20T18:17:54
  'PG4hCCqAJ8BcWjSA',  // 2025-11-20T19:17:16
];

// bot_oLYqcUL7ac - KEEP: oPHhTcIh6i8tFG0S (2025-11-20T20:53:19)
const bot_oLYqcUL7ac_delete = [
  'hJbmd5reh9SP6caM',  // 2025-11-20T19:53:17
  '67DPoqG3L5NA5hMU',  // 2025-11-20T12:53:16
  'fc2xQ2UKxKqkzRwi',  // 2025-11-20T13:53:16
  '7nNXzJGcT7PGytr3',  // 2025-11-20T17:54:26
  '07FSrQzAgiKLAiqY',  // 2025-11-20T16:53:16
  'EZTUx1dufENadVAo',  // 2025-11-20T11:53:17
  '2swLf43LaOjPY7GV',  // 2025-11-20T14:53:17
  'Zg7QpPhMLsEb9ICP',  // 2025-11-20T15:53:16
  '2LxoHSL7BhNoSxoG',  // 2025-11-20T18:53:16
];

// bot_WOSOzj5wnM - KEEP: sKbTLorDWIX1z4fG (2025-11-20T19:18:16)
const bot_WOSOzj5wnM_delete = [
  'dU7HpsPIwvejdnFC',  // 2025-11-20T14:18:16
  'wp3S63NQzntgIAn0',  // 2025-11-20T16:18:16
];

// bot_RMtmBN0Noc - KEEP: db6BlyMTFZDPljAD (2025-11-20T20:03:17)
const bot_RMtmBN0Noc_delete = [
  'myK4NnP1XZ3Mse2k',  // 2025-11-20T12:03:30
  'iFLOZDKzCxJrZw0y',  // 2025-11-20T19:03:16
  's85QL1Dl6xRVk5RH',  // 2025-11-20T14:03:17
  'a0Wo67kfMwspWg0p',  // 2025-11-20T15:03:16
  'tmWigKmTuhnho5L4',  // 2025-11-20T13:03:16
  '9A3fz7ZeRXViaWA0',  // 2025-11-20T17:03:16
  'rVqpawvbZbOL0EOB',  // 2025-11-20T16:03:16
  'hhZZZV3ymeBL7isF',  // 2025-11-20T18:03:51
];

// Other test bots to delete
const other_test_bots = [
  'xtAOHzM5O1Uy5PSE',  // bot_YmPML-n1Rt
  'ayUIRxdLrjRydVAC',  // bot_-B1rERTUG1
];

// Combine all
const allToDelete = [
  ...bot_LJlWQhRZol_delete,
  ...bot_yjB4Oo3GBj_delete,
  ...bot_qzNBwMJmY9_delete,
  ...bot_oLYqcUL7ac_delete,
  ...bot_WOSOzj5wnM_delete,
  ...bot_RMtmBN0Noc_delete,
  ...other_test_bots,
];

console.log('Total workflows to delete:', allToDelete.length);
console.log(JSON.stringify(allToDelete, null, 2));
