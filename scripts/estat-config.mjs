// e-Stat API 取得設定。appId はここに書かない(環境変数 ESTAT_APP_ID で渡す)。
export const AREAS_PREF = Array.from({ length: 47 }, (_, i) => String(i + 1).padStart(2, '0') + '000');
export const AREAS_OKINAWA_MUNI = '47201,47205,47207,47208,47209,47210,47211,47212,47213,47214,47215,47301,47302,47303,47306,47308,47311,47313,47314,47315,47324,47325,47326,47327,47328,47329,47348,47350,47353,47354,47355,47356,47357,47358,47359,47360,47361,47362,47375,47381,47382'.split(',');
const seq = (p, a, b) => Array.from({ length: b - a + 1 }, (_, i) => p + String(a + i).padStart(2, '0'));
export const DATASETS = [
  { key: 'population', label: '5歳階級別人口', statsDataId: '0000010101', areas: AREAS_PREF, cat01: seq('A12', 1, 21) },
  { key: 'establishments', label: '事業所数(民営・従業者規模別)', statsDataId: '0000010103', areas: AREAS_PREF, cat01: seq('C2108', 1, 7) },
  { key: 'income', label: '収入関連', statsDataId: '0000010112', areas: AREAS_PREF, cat01: ['L7610', 'L7611', 'L761101', 'L761102', 'L761103', 'L7612'] },
  { key: 'leisure', label: '余暇関連', statsDataId: '0000010113', areas: AREAS_PREF, cat01: 'M320100,M320200,M330100,M330200,M340100,M340200,M350100,M350200,M360100,M360200,M370100,M370200,M380100,M380200,M390100,M390200'.split(',') },
  { key: 'okinawa_municipal_age', label: '沖縄県市町村別3区分年齢', statsDataId: '0000020201', areas: AREAS_OKINAWA_MUNI, cat01: ['A1301', 'A1302', 'A1303'] },
];
