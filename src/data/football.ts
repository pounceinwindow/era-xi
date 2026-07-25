import type { ClubEra, Formation, FormationId, Player, Position } from "../game/types.ts";

export const formations: Record<FormationId, Formation> = {
  "4-3-3": { id: "4-3-3", slots: ["GK", "LB", "CB", "CB", "RB", "CM", "CM", "AM", "LW", "ST", "RW"] },
  "4-2-3-1": { id: "4-2-3-1", slots: ["GK", "LB", "CB", "CB", "RB", "DM", "DM", "LW", "AM", "RW", "ST"] },
  "4-4-2": { id: "4-4-2", slots: ["GK", "LB", "CB", "CB", "RB", "LM", "CM", "CM", "RM", "ST", "ST"] },
  "3-5-2": { id: "3-5-2", slots: ["GK", "CB", "CB", "CB", "LWB", "RWB", "DM", "CM", "AM", "ST", "ST"] }
};

type Seed = [string, string, string, Position, Position[], number, string];
const seeds: Seed[] = [
  ["casillas","Икер Касильяс","ESP","GK",[],94,"Iker Casillas"],["r-carlos","Роберто Карлос","BRA","LB",["LWB"],93,"Roberto Carlos"],
  ["zidane","Зинедин Зидан","FRA","AM",["CM"],96,"Zinedine Zidane"],["figo","Луиш Фигу","POR","RW",["RM"],94,"Luís Figo"],
  ["raul","Рауль","ESP","ST",[],93,"Raúl (footballer)"],["makelele","Клод Макелеле","FRA","DM",["CM"],92,"Claude Makélélé"],
  ["dida","Дида","BRA","GK",[],90,"Dida (footballer, born 1973)"],["maldini","Паоло Мальдини","ITA","CB",["LB"],96,"Paolo Maldini"],
  ["nesta","Алессандро Неста","ITA","CB",[],94,"Alessandro Nesta"],["pirlo","Андреа Пирло","ITA","CM",["DM"],94,"Andrea Pirlo"],
  ["kaka","Кака","BRA","AM",["CM"],95,"Kaká"],["seedorf","Кларенс Зеедорф","NED","CM",["AM"],92,"Clarence Seedorf"],
  ["lehmann","Йенс Леманн","GER","GK",[],88,"Jens Lehmann"],["campbell","Сол Кэмпбелл","ENG","CB",[],91,"Sol Campbell"],
  ["vieira","Патрик Виейра","FRA","CM",["DM"],93,"Patrick Vieira"],["bergkamp","Деннис Бергкамп","NED","ST",["AM"],94,"Dennis Bergkamp"],
  ["henry","Тьерри Анри","FRA","ST",["LW"],96,"Thierry Henry"],["pires","Робер Пирес","FRA","LM",["LW"],91,"Robert Pires"],
  ["v-baia","Витор Баия","POR","GK",[],88,"Vítor Baía"],["r-carvalho","Рикарду Карвалью","POR","CB",[],92,"Ricardo Carvalho"],
  ["costinha","Коштинья","POR","DM",["CM"],87,"Costinha"],["deco","Деку","POR","AM",["CM"],92,"Deco"],
  ["derlei","Дерлей","BRA","ST",[],87,"Derlei"],["maniche","Манише","POR","CM",[],89,"Maniche"],
  ["dudek","Ежи Дудек","POL","GK",[],87,"Jerzy Dudek"],["carragher","Джейми Каррагер","ENG","CB",["RB"],89,"Jamie Carragher"],
  ["xabi","Хаби Алонсо","ESP","CM",["DM"],93,"Xabi Alonso"],["gerrard","Стивен Джеррард","ENG","CM",["AM"],95,"Steven Gerrard"],
  ["l-garcia","Луис Гарсия","ESP","RW",["AM"],88,"Luis García (footballer, born 1978)"],["hyypia","Сами Хююпия","FIN","CB",[],90,"Sami Hyypiä"],
  ["valdes","Виктор Вальдес","ESP","GK",[],89,"Víctor Valdés"],["puyol","Карлес Пуйоль","ESP","CB",["RB"],94,"Carles Puyol"],
  ["xavi","Хави","ESP","CM",[],96,"Xavi"],["iniesta","Андрес Иньеста","ESP","CM",["AM"],96,"Andrés Iniesta"],
  ["messi","Лионель Месси","ARG","RW",["AM","ST"],99,"Lionel Messi"],["eto","Самюэль Это’о","CMR","ST",[],95,"Samuel Eto'o"],
  ["van-der-sar","Эдвин ван дер Сар","NED","GK",[],93,"Edwin van der Sar"],["ferdinand","Рио Фердинанд","ENG","CB",[],93,"Rio Ferdinand"],
  ["vidic","Неманья Видич","SRB","CB",[],93,"Nemanja Vidić"],["rooney","Уэйн Руни","ENG","ST",["AM"],94,"Wayne Rooney"],
  ["ronaldo","Криштиану Роналду","POR","LW",["ST","RW"],98,"Cristiano Ronaldo"],["scholes","Пол Скоулз","ENG","CM",[],93,"Paul Scholes"],
  ["j-cesar","Жулио Сезар","BRA","GK",[],91,"Júlio César Soares Espíndola"],["lucio","Лусио","BRA","CB",[],92,"Lúcio"],
  ["zanetti","Хавьер Санетти","ARG","RB",["LB","DM"],94,"Javier Zanetti"],["sneijder","Уэсли Снейдер","NED","AM",["CM"],94,"Wesley Sneijder"],
  ["milito","Диего Милито","ARG","ST",[],93,"Diego Milito"],["cambiasso","Эстебан Камбьяссо","ARG","DM",["CM"],91,"Esteban Cambiasso"],
  ["cech","Петр Чех","CZE","GK",[],94,"Petr Čech"],["terry","Джон Терри","ENG","CB",[],93,"John Terry"],
  ["lampard","Фрэнк Лэмпард","ENG","CM",["AM"],94,"Frank Lampard"],["drogba","Дидье Дрогба","CIV","ST",[],94,"Didier Drogba"],
  ["a-cole","Эшли Коул","ENG","LB",[],93,"Ashley Cole"],["mata","Хуан Мата","ESP","AM",["RW"],90,"Juan Mata"],
  ["neuer","Мануэль Нойер","GER","GK",[],96,"Manuel Neuer"],["lahm","Филипп Лам","GER","RB",["LB","DM"],95,"Philipp Lahm"],
  ["schweini","Бастиан Швайнштайгер","GER","CM",["DM"],94,"Bastian Schweinsteiger"],["ribery","Франк Рибери","FRA","LW",["LM"],94,"Franck Ribéry"],
  ["robben","Арьен Роббен","NED","RW",["RM"],95,"Arjen Robben"],["muller","Томас Мюллер","GER","AM",["ST","RW"],93,"Thomas Müller"],
  ["weidenfeller","Роман Вайденфеллер","GER","GK",[],88,"Roman Weidenfeller"],["hummels","Матс Хуммельс","GER","CB",[],92,"Mats Hummels"],
  ["gundogan","Илкай Гюндоган","GER","CM",["AM"],93,"İlkay Gündoğan"],["reus","Марко Ройс","GER","AM",["LW"],92,"Marco Reus"],
  ["lewandowski","Роберт Левандовский","POL","ST",[],97,"Robert Lewandowski"],["subotic","Невен Суботич","SRB","CB",[],87,"Neven Subotić"],
  ["navas","Кейлор Навас","CRC","GK",[],91,"Keylor Navas"],["ramos","Серхио Рамос","ESP","CB",["RB"],95,"Sergio Ramos"],
  ["modric","Лука Модрич","CRO","CM",["AM"],96,"Luka Modrić"],["kroos","Тони Кроос","GER","CM",[],95,"Toni Kroos"],
  ["marcelo","Марсело","BRA","LB",["LWB"],93,"Marcelo (footballer, born 1988)"],["bale","Гарет Бейл","WAL","RW",["LW"],94,"Gareth Bale"],
  ["buffon","Джанлуиджи Буффон","ITA","GK",[],96,"Gianluigi Buffon"],["bonucci","Леонардо Бонуччи","ITA","CB",[],92,"Leonardo Bonucci"],
  ["chiellini","Джорджо Кьеллини","ITA","CB",["LB"],93,"Giorgio Chiellini"],["dybala","Пауло Дибала","ARG","AM",["ST"],92,"Paulo Dybala"],
  ["higuain","Гонсало Игуаин","ARG","ST",[],92,"Gonzalo Higuaín"],["mandzukic","Марио Манджукич","CRO","ST",["LW"],90,"Mario Mandžukić"],
  ["ter-stegen","Марк-Андре тер Стеген","GER","GK",[],92,"Marc-André ter Stegen"],["alba","Жорди Альба","ESP","LB",["LWB"],92,"Jordi Alba"],
  ["busquets","Серхио Бускетс","ESP","DM",["CM"],95,"Sergio Busquets"],["neymar","Неймар","BRA","LW",["AM"],96,"Neymar"],
  ["suarez","Луис Суарес","URU","ST",[],96,"Luis Suárez"],["rakitic","Иван Ракитич","CRO","CM",["AM"],92,"Ivan Rakitić"],
  ["courtois","Тибо Куртуа","BEL","GK",[],95,"Thibaut Courtois"],["godin","Диего Годин","URU","CB",[],93,"Diego Godín"],
  ["koke","Коке","ESP","CM",["LM"],91,"Koke (footballer, born 1992)"],["gabi","Габи","ESP","CM",["DM"],89,"Gabi (footballer, born 1983)"],
  ["d-costa","Диего Коста","ESP","ST",[],92,"Diego Costa"],["juanfran","Хуанфран","ESP","RB",[],88,"Juanfran (footballer, born 1985)"],
  ["onana","Андре Онана","CMR","GK",[],89,"André Onana"],["de-ligt","Маттейс де Лигт","NED","CB",[],91,"Matthijs de Ligt"],
  ["de-jong","Френки де Йонг","NED","CM",["DM"],93,"Frenkie de Jong"],["ziyech","Хаким Зиеш","MAR","RW",["AM"],90,"Hakim Ziyech"],
  ["tadic","Душан Тадич","SRB","LW",["AM"],90,"Dušan Tadić"],["vdb","Донни ван де Бек","NED","AM",["CM"],87,"Donny van de Beek"],
  ["alisson","Алиссон","BRA","GK",[],94,"Alisson Becker"],["van-dijk","Вирджил ван Дейк","NED","CB",[],96,"Virgil van Dijk"],
  ["fabinho","Фабиньо","BRA","DM",["RB"],92,"Fabinho (footballer, born 1993)"],["mane","Садио Мане","SEN","LW",["ST"],94,"Sadio Mané"],
  ["salah","Мохамед Салах","EGY","RW",["ST"],96,"Mohamed Salah"],["trent","Трент Александер-Арнольд","ENG","RB",["RWB"],92,"Trent Alexander-Arnold"],
  ["kimmich","Йозуа Киммих","GER","DM",["RB","CM"],94,"Joshua Kimmich"],["thiago","Тиаго Алькантара","ESP","CM",[],93,"Thiago Alcântara"],["davies","Альфонсо Дэвис","CAN","LB",["LWB"],91,"Alphonso Davies"],
  ["gnabry","Серж Гнабри","GER","RW",["LW"],91,"Serge Gnabry"],["marquinhos","Маркиньос","BRA","CB",["DM"],92,"Marquinhos"],
  ["verratti","Марко Верратти","ITA","CM",["DM"],92,"Marco Verratti"],["mbappe","Килиан Мбаппе","FRA","ST",["LW"],97,"Kylian Mbappé"],
  ["di-maria","Анхель Ди Мария","ARG","RW",["AM"],93,"Ángel Di María"],["ederson","Эдерсон","BRA","GK",[],92,"Ederson (footballer, born 1993)"],
  ["dias","Рубен Диаш","POR","CB",[],93,"Rúben Dias"],["rodri","Родри","ESP","DM",["CM"],96,"Rodri (footballer, born 1996)"],
  ["de-bruyne","Кевин Де Брёйне","BEL","AM",["CM"],97,"Kevin De Bruyne"],["haaland","Эрлинг Холанд","NOR","ST",[],96,"Erling Haaland"],
  ["bernardo","Бернарду Силва","POR","AM",["RW","CM"],94,"Bernardo Silva"],["mendy","Эдуар Менди","SEN","GK",[],89,"Édouard Mendy"],
  ["rudiger","Антонио Рюдигер","GER","CB",[],92,"Antonio Rüdiger"],["kante","Н’Голо Канте","FRA","CM",["DM"],95,"N'Golo Kanté"],
  ["havertz","Кай Хаверц","GER","AM",["ST"],91,"Kai Havertz"],["mount","Мейсон Маунт","ENG","AM",["CM"],89,"Mason Mount"],
  ["jorginho","Жоржиньо","ITA","DM",["CM"],91,"Jorginho (footballer, born December 1991)"],["militao","Эдер Милитао","BRA","CB",["RB"],91,"Éder Militão"],
  ["casemiro","Каземиро","BRA","DM",["CM"],94,"Casemiro"],["benzema","Карим Бензема","FRA","ST",[],97,"Karim Benzema"],
  ["vinicius","Винисиус Жуниор","BRA","LW",[],95,"Vinícius Júnior"],["valverde","Федерико Вальверде","URU","CM",["RM"],92,"Federico Valverde"],
  ["meret","Алекс Мерет","ITA","GK",[],87,"Alex Meret"],["kim","Ким Мин Джэ","KOR","CB",[],91,"Kim Min-jae (footballer)"],
  ["lobotka","Станислав Лоботка","SVK","CM",["DM"],89,"Stanislav Lobotka"],["kvara","Хвича Кварацхелия","GEO","LW",[],92,"Khvicha Kvaratskhelia"],
  ["osimhen","Виктор Осимхен","NGA","ST",[],93,"Victor Osimhen"],["di-lorenzo","Джованни Ди Лоренцо","ITA","RB",[],88,"Giovanni Di Lorenzo"],
  ["bastoni","Алессандро Бастони","ITA","CB",[],91,"Alessandro Bastoni"],["barella","Николо Барелла","ITA","CM",[],93,"Nicolò Barella"],
  ["calhanoglu","Хакан Чалханоглу","TUR","CM",["AM"],91,"Hakan Çalhanoğlu"],["lautaro","Лаутаро Мартинес","ARG","ST",[],93,"Lautaro Martínez"],
  ["dimarco","Федерико Димарко","ITA","LWB",["LB"],89,"Federico Dimarco"],["dzeko","Эдин Джеко","BIH","ST",[],90,"Edin Džeko"]
];

export const clubEras: ClubEra[] = [
  ["real-02","real","Real Madrid","2001/02","4-2-3-1",["casillas","r-carlos","zidane","figo","raul","makelele"],["#f4f1e8","#7c6df2"]],
  ["milan-07","milan","Milan","2006/07","4-3-3",["dida","maldini","nesta","pirlo","kaka","seedorf"],["#d92f3d","#151515"]],
  ["arsenal-04","arsenal","Arsenal","2003/04","4-4-2",["lehmann","campbell","vieira","bergkamp","henry","pires"],["#dc2e3f","#f4d39b"]],
  ["porto-04","porto","Porto","2003/04","4-4-2",["v-baia","r-carvalho","costinha","deco","derlei","maniche"],["#1571ce","#f1f5f9"]],
  ["liverpool-05","liverpool","Liverpool","2004/05","4-2-3-1",["dudek","carragher","xabi","gerrard","l-garcia","hyypia"],["#c51d34","#f5e6cf"]],
  ["barca-09","barca","Barcelona","2008/09","4-3-3",["valdes","puyol","xavi","iniesta","messi","eto"],["#2a3f91","#a51d4c"]],
  ["united-08","united","Manchester United","2007/08","4-4-2",["van-der-sar","ferdinand","vidic","rooney","ronaldo","scholes"],["#c92132","#171717"]],
  ["inter-10","inter","Inter","2009/10","4-2-3-1",["j-cesar","lucio","zanetti","sneijder","milito","cambiasso"],["#1465a9","#111827"]],
  ["chelsea-12","chelsea","Chelsea","2011/12","4-2-3-1",["cech","terry","lampard","drogba","a-cole","mata"],["#16469b","#e9c24f"]],
  ["bayern-13","bayern","Bayern","2012/13","4-2-3-1",["neuer","lahm","schweini","ribery","robben","muller"],["#d31e3c","#e8edf5"]],
  ["dortmund-13","dortmund","Dortmund","2012/13","4-2-3-1",["weidenfeller","hummels","gundogan","reus","lewandowski","subotic"],["#f5d90a","#171717"]],
  ["real-17","real","Real Madrid","2016/17","4-3-3",["navas","ramos","modric","kroos","ronaldo","marcelo","bale"],["#f4f1e8","#8d75cc"]],
  ["juve-17","juve","Juventus","2016/17","3-5-2",["buffon","bonucci","chiellini","dybala","higuain","mandzukic"],["#f1f1e9","#181818"]],
  ["barca-15","barca","Barcelona","2014/15","4-3-3",["ter-stegen","alba","busquets","neymar","suarez","rakitic"],["#213f8f","#ae204d"]],
  ["atleti-14","atleti","Atlético","2013/14","4-4-2",["courtois","godin","koke","gabi","d-costa","juanfran"],["#d52d3d","#f6eee3"]],
  ["ajax-19","ajax","Ajax","2018/19","4-3-3",["onana","de-ligt","de-jong","ziyech","tadic","vdb"],["#f1f0e8","#d92d3f"]],
  ["liverpool-19","liverpool","Liverpool","2018/19","4-3-3",["alisson","van-dijk","fabinho","mane","salah","trent"],["#c51d34","#e8d8bd"]],
  ["bayern-20","bayern","Bayern","2019/20","4-2-3-1",["neuer","kimmich","thiago","muller","lewandowski","davies","gnabry"],["#d31e3c","#eef2f6"]],
  ["psg-20","psg","Paris","2019/20","4-3-3",["navas","marquinhos","verratti","neymar","mbappe","di-maria"],["#18345f","#cc3145"]],
  ["city-23","city","Manchester City","2022/23","4-3-3",["ederson","dias","rodri","de-bruyne","haaland","bernardo"],["#77b9df","#172538"]],
  ["chelsea-21","chelsea","Chelsea","2020/21","3-5-2",["mendy","rudiger","kante","havertz","mount","jorginho"],["#16469b","#d9bd6c"]],
  ["real-22","real","Real Madrid","2021/22","4-3-3",["courtois","militao","casemiro","benzema","vinicius","valverde"],["#f4f1e8","#8d75cc"]],
  ["napoli-23","napoli","Napoli","2022/23","4-3-3",["meret","kim","lobotka","kvara","osimhen","di-lorenzo"],["#178fc4","#e6edf2"]],
  ["inter-23","inter","Inter","2022/23","3-5-2",["onana","bastoni","barella","calhanoglu","lautaro","dimarco","dzeko"],["#1465a9","#111827"]]]
    .map(([id,clubId,clubName,season,formation,roster,colors]) => ({ id,clubId,clubName,season,formation,roster,colors } as ClubEra));

const lineFor = (position: Position) =>
  position === "GK" ? "keeper" : ["LB","CB","RB","LWB","RWB"].includes(position) ? "defense" :
    ["DM","CM","AM","LM","RM"].includes(position) ? "midfield" : "attack";

export const players: Player[] = seeds.map(([id,name,country,primary,secondary,rating,wikiTitle]) => {
  const line = lineFor(primary);
  const variation = id.split("").reduce((sum, char) => sum + char.charCodeAt(0), 0) % 5;
  const eras = clubEras.filter((era) => era.roster.includes(id));
  return {
    id, name, country, positions: [primary, ...secondary], rating, wikiTitle,
    attack: line === "attack" ? rating : line === "midfield" ? rating - 12 : Math.max(28, rating - 38 + variation),
    midfield: line === "midfield" ? rating : line === "attack" ? rating - 17 : line === "defense" ? rating - 22 : 42,
    defense: line === "defense" ? rating : line === "midfield" ? rating - 28 : line === "keeper" ? rating - 12 : rating - 48,
    goalkeeping: line === "keeper" ? rating : 12 + variation,
    clubIds: [...new Set(eras.map((era) => era.clubId))],
    preferredFormations: [...new Set(eras.map((era) => era.formation))]
  };
});

export const playerById = new Map(players.map((player) => [player.id, player]));
export const eraById = new Map(clubEras.map((era) => [era.id, era]));
