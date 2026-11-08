import type { CardStat, EventStat } from "./types";

export const MEMORY_CARDS: CardStat[] = [
  { id: "c-doi-moi-1986", milestoneId: "vn-doi-moi-1986", kind: "memory", year: 1986, icon: "🏪", verb: "Mở tiệm tạp hoá tư nhân", story: "Nhà nước vừa cho phép buôn bán tự do.", stake: "half", winIn10: 8, winMult: 3, loseMult: 0.5, loseWhy: "siêu lạm phát cuối thập niên 1980 ăn mòn tiền" },
  { id: "c-phu-my-hung-1993", milestoneId: "vn-phu-my-hung-land", kind: "memory", year: 1993, icon: "🏞️", verb: "Mua đất đầm lầy Nam Sài Gòn", story: "Ai cũng chê sình lầy, bạn nhớ đại lộ sẽ mọc lên.", stake: "half", winIn10: 9, winMult: 6, loseMult: 0.5, loseWhy: "kẹt vốn, thanh khoản thấp nhiều năm" },
  { id: "c-us-embargo-1994", milestoneId: "vn-us-embargo-lift-1994", kind: "memory", year: 1994, icon: "🚢", verb: "Mở công ty xuất nhập khẩu", story: "Mỹ vừa dỡ cấm vận, hàng hoá sắp thông thương.", stake: "quarter", winIn10: 8, winMult: 3, loseMult: 0.5, loseWhy: "thủ tục còn rối, vốn kẹt lại" },
  { id: "c-us-normalize-1995", milestoneId: "vn-us-normalization-1995", kind: "memory", year: 1995, icon: "🤝", verb: "Đón khách Mỹ đầu tiên về làm ăn", story: "Hai nước vừa bình thường hoá quan hệ.", stake: "quarter", winIn10: 8, winMult: 2, loseMult: 0.5, loseWhy: "đối tác rút lui giữa chừng" },
  { id: "c-coffee-1996", milestoneId: "vn-coffee-chain-boom", kind: "rumor", year: 1996, icon: "☕", verb: "Mở chuỗi quán cà phê kiểu mới", story: "Thiên hạ bảo dân mình không chịu trả tiền cho cà phê sang.", stake: "quarter", winIn10: 4, winMult: 8, loseMult: 0, loseWhy: "quán đóng cửa, mất trắng vốn mặt bằng" },
  { id: "c-hose-2000", milestoneId: "vn-hose-first-session-2000", kind: "rumor", year: 2000, icon: "📈", verb: "Mua REE, SAM phiên đầu tiên", story: "Thiên hạ bảo sàn chứng khoán là trò chơi của Tây.", stake: "half", winIn10: 6, winMult: 4, loseMult: 0.5, loseWhy: "thanh khoản cực thấp, kẹt lệnh nhiều tháng" },
  { id: "c-bta-2001", milestoneId: "vn-bta-2001", kind: "memory", year: 2001, icon: "🧵", verb: "Mở xưởng may xuất khẩu Mỹ", story: "Hiệp định thương mại Việt-Mỹ vừa ký.", stake: "half", winIn10: 8, winMult: 2, loseMult: 0.5, loseWhy: "bị kiện chống bán phá giá" },
  { id: "c-hnx-2005", milestoneId: "vn-hnx-launch-2005", kind: "memory", year: 2005, icon: "🏦", verb: "Mua cổ phiếu sàn Hà Nội mới mở", story: "Sàn giao dịch thứ hai vừa khai trương.", stake: "half", winIn10: 7, winMult: 3, loseMult: 0.5, loseWhy: "cổ phiếu nhỏ, thanh khoản yếu" },
  { id: "c-vinamilk-2006", milestoneId: "vn-vinamilk-listing-2006", kind: "memory", year: 2006, icon: "🥛", verb: "Mua cổ phiếu Vinamilk ngày niêm yết", story: "Hãng sữa quốc dân vừa lên sàn.", stake: "half", winIn10: 9, winMult: 2, loseMult: 0.7, loseWhy: "thị trường chung điều chỉnh ngắn hạn" },
  { id: "c-fpt-2006", milestoneId: "vn-fpt-listing-2006", kind: "memory", year: 2006, icon: "💻", verb: "Gom cổ phiếu FPT trên OTC", story: "Công ty công nghệ tư nhân lớn nhất sắp lên sàn.", stake: "all", winIn10: 7, winMult: 2.5, loseMult: 0.3, loseWhy: "mua đuổi, rồi sập theo thị trường 2008" },
  { id: "c-wto-2007", milestoneId: "vn-wto-accession-2007", kind: "memory", year: 2007, icon: "🌐", verb: "Đón sóng vốn ngoại đổ vào", story: "Việt Nam vừa gia nhập WTO.", stake: "half", winIn10: 6, winMult: 3, loseMult: 0.4, loseWhy: "bong bóng chứng khoán xì hơi ngay sau đó" },
  { id: "c-vingroup-2007", milestoneId: "vn-vingroup-listing-2007", kind: "memory", year: 2007, icon: "🏢", verb: "Mua cổ phiếu Vingroup ngày đầu", story: "Tập đoàn bất động sản tư nhân lớn vừa niêm yết.", stake: "half", winIn10: 7, winMult: 4, loseMult: 0.3, loseWhy: "thị trường chung lao dốc cuối 2007" },
  { id: "c-hoaphat-2007", milestoneId: "vn-hoa-phat-listing-2007", kind: "memory", year: 2007, icon: "🏗️", verb: "Mua cổ phiếu thép Hoà Phát", story: "Doanh nghiệp thép tư nhân vừa lên sàn.", stake: "half", winIn10: 7, winMult: 3, loseMult: 0.4, loseWhy: "giá thép thế giới lao dốc" },
  { id: "c-gold-2008", milestoneId: "vn-gold-surge-2008-2011", kind: "memory", year: 2008, icon: "🪙", verb: "Mua vàng trước cơn sốt", story: "Khủng hoảng tài chính toàn cầu vừa nổ ra.", stake: "half", winIn10: 8, winMult: 2.8, loseMult: 0.7, loseWhy: "giá vàng trong nước lệch mạnh với thế giới" },
  { id: "c-vnindex-bottom-2009", milestoneId: "vn-vnindex-bottom-2009", kind: "memory", year: 2009, icon: "📉", verb: "Mua cổ phiếu đáy khủng hoảng", story: "VN-Index vừa rơi xuống vùng thấp kỷ lục.", stake: "half", winIn10: 7, winMult: 3, loseMult: 0.5, loseWhy: "hồi phục chậm hơn kỳ vọng" },
  { id: "c-ecommerce-2010", milestoneId: "vn-ecommerce-boom", kind: "rumor", year: 2010, icon: "🛒", verb: "Mở sàn thương mại điện tử", story: "Thiên hạ bảo người Việt chỉ quen mua ở chợ.", stake: "quarter", winIn10: 3, winMult: 10, loseMult: 0, loseWhy: "cháy vốn trước khi thị trường đủ lớn" },
  { id: "c-re-slump-2011", milestoneId: "vn-real-estate-slump-2011-2013", kind: "memory", year: 2011, icon: "🏚️", verb: "Gom đất lúc thị trường đóng băng", story: "Bất động sản vừa trải qua cú sốc lãi suất.", stake: "half", winIn10: 8, winMult: 1.8, loseMult: 0.8, loseWhy: "thanh khoản đóng băng lâu hơn dự tính" },
  { id: "c-grab-2014", milestoneId: "vn-ridehailing-grab-2014", kind: "rumor", year: 2014, icon: "🛵", verb: "Làm tài xế công nghệ sớm nhất", story: "Thiên hạ bảo app gọi xe ngoại sẽ sớm dẹp tiệm.", stake: "quarter", winIn10: 6, winMult: 2, loseMult: 0.5, loseWhy: "chiết khấu tăng dần, thu nhập giảm" },
  { id: "c-mwg-2014", milestoneId: "vn-mwg-listing-2014", kind: "memory", year: 2014, icon: "📱", verb: "Mua cổ phiếu Thế Giới Di Động", story: "Chuỗi bán lẻ điện thoại vừa niêm yết.", stake: "half", winIn10: 8, winMult: 4, loseMult: 0.5, loseWhy: "cạnh tranh bán lẻ khốc liệt hơn" },
  { id: "c-longthanh-2015", milestoneId: "vn-long-thanh-airport-2015", kind: "memory", year: 2015, icon: "✈️", verb: "Mua đất quanh sân bay tương lai", story: "Chủ trương xây sân bay Long Thành vừa được duyệt.", stake: "half", winIn10: 5, winMult: 4, loseMult: 0.3, loseWhy: "quy hoạch treo kéo dài hơn một thập kỷ" },
  { id: "c-vjc-2017", milestoneId: "vn-vjc-listing-2017", kind: "memory", year: 2017, icon: "🛩️", verb: "Mua cổ phiếu Vietjet ngày đầu", story: "Hãng bay giá rẻ tư nhân đầu tiên vừa lên sàn.", stake: "half", winIn10: 6, winMult: 2, loseMult: 0.6, loseWhy: "giá nhiên liệu biến động mạnh" },
  { id: "c-covid-2020", milestoneId: "vn-covid-bottom-2020", kind: "memory", year: 2020, icon: "🦠", verb: "Mua cổ phiếu đáy COVID-19", story: "Thị trường vừa hoảng loạn vì đại dịch.", stake: "half", winIn10: 8, winMult: 2.3, loseMult: 0.6, loseWhy: "dịch kéo dài hơn dự đoán" },
  { id: "c-crypto-2021", milestoneId: "vn-crypto-boom-vietnam", kind: "rumor", year: 2021, icon: "🪙", verb: "Chơi game kiếm tiền crypto sớm", story: "Thiên hạ bảo chơi game kiếm tiền thật là trò lừa.", stake: "quarter", winIn10: 3, winMult: 30, loseMult: 0, loseWhy: "dự án sập, token về 0" },
  { id: "c-vinfast-2023", milestoneId: "vn-vinfast-nasdaq-2023", kind: "memory", year: 2023, icon: "🚗", verb: "Mua cổ phiếu VinFast IPO", story: "Hãng xe điện Việt vừa niêm yết ở Mỹ.", stake: "quarter", winIn10: 4, winMult: 3.7, loseMult: 0.2, loseWhy: "cổ phiếu biến động cực mạnh sau niêm yết" },
  { id: "c-gold-2024", milestoneId: "vn-gold-surge-2024", kind: "memory", year: 2024, icon: "🪙", verb: "Mua vàng trước đợt tăng mới", story: "Giá vàng thế giới vừa lập đỉnh mới.", stake: "half", winIn10: 9, winMult: 1.3, loseMult: 0.9, loseWhy: "nhà nước can thiệp bình ổn giá" },
];

export const TRAP_CARDS: CardStat[] = [
  { id: "t-vnindex-2007", milestoneId: "vn-vnindex-peak-2007", kind: "trap", year: 2007, icon: "📈", verb: "Mua thêm khi VN-Index vượt 1.100", story: "Ai cũng đang lãi, sao mình lại đứng ngoài?", stake: "half", winIn10: 8, winMult: 3, loseMult: 0.3, loseWhy: "mua đuổi đỉnh", real: { winIn10: 1, winMult: 1.5, loseMult: 0.3, loseWhy: "VN-Index rơi từ đỉnh 1.170 (12/3/2007) về 235 điểm (2/2009)", explain: "VN-Index lập đỉnh lịch sử 1.170,67 điểm ngày 12/3/2007, rồi rơi về 235,5 điểm tháng 2/2009." } },
  { id: "t-fpt-chase-2006", milestoneId: "vn-fpt-listing-2006", kind: "trap", year: 2006, icon: "💻", verb: "Mua đuổi FPT sau khi đã tăng trần", story: "Giá đã tăng mấy phiên liên tiếp, chắc còn tăng nữa.", stake: "half", winIn10: 8, winMult: 2, loseMult: 0.3, loseWhy: "mua đỉnh ngắn hạn", real: { winIn10: 1, winMult: 1.3, loseMult: 0.3, loseWhy: "giá điều chỉnh mạnh ngay sau khi tăng trần phiên đầu", explain: "FPT tăng trần phiên chào sàn rồi sớm điều chỉnh khi thị trường chung quay đầu 2007-2008." } },
  { id: "t-gold-2011", milestoneId: "vn-gold-surge-2008-2011", kind: "trap", year: 2011, icon: "🪙", verb: "Mua vàng khi báo đài liên tục đưa tin giá kỷ lục", story: "Ai cũng nói vàng sẽ còn lên nữa.", stake: "half", winIn10: 8, winMult: 2, loseMult: 0.6, loseWhy: "mua đỉnh ngắn hạn", real: { winIn10: 1, winMult: 1.2, loseMult: 0.6, loseWhy: "vàng trong nước lập đỉnh cuối 2011 rồi đi ngang nhiều năm", explain: "Giá vàng SJC lập đỉnh khoảng 49 triệu đồng/lượng cuối 2011 - đầu 2012, sau đó đi ngang kéo dài." } },
  { id: "t-landfever-2015", milestoneId: "vn-long-thanh-airport-2015", kind: "trap", year: 2015, icon: "🏞️", verb: "Mua đất ăn theo tin đồn sốt đất", story: "Cò đất nói giá sắp gấp đôi vì quy hoạch mới.", stake: "half", winIn10: 7, winMult: 3, loseMult: 0.3, loseWhy: "mua theo tin đồn", real: { winIn10: 2, winMult: 1.5, loseMult: 0.3, loseWhy: "quy hoạch treo kéo dài, vốn chôn nhiều năm không thanh khoản", explain: "Nhiều cơn sốt đất ăn theo quy hoạch sân bay Long Thành đã nguội nhanh khi dự án chậm triển khai." } },
  { id: "t-axie-2022", milestoneId: "vn-crypto-boom-vietnam", kind: "trap", year: 2022, icon: "🪙", verb: "Mua đuổi token game crypto đang hot", story: "Bạn bè khoe lãi gấp mấy lần chỉ trong vài tuần.", stake: "quarter", winIn10: 6, winMult: 5, loseMult: 0.05, loseWhy: "mua đỉnh cơn sốt", real: { winIn10: 1, winMult: 2, loseMult: 0.05, loseWhy: "thị trường game crypto sụp đổ ngay sau đỉnh 2021-2022", explain: "Nhiều token game crypto Việt Nam mất hơn 90% giá trị sau khi cơn sốt 2021 hạ nhiệt." } },
  { id: "t-vinfast-chase-2023", milestoneId: "vn-vinfast-nasdaq-2023", kind: "trap", year: 2023, icon: "🚗", verb: "Mua đuổi VinFast ngay sau khi lên sàn", story: "Cổ phiếu tăng gấp mấy lần chỉ trong vài phiên.", stake: "quarter", winIn10: 6, winMult: 3, loseMult: 0.2, loseWhy: "mua đỉnh ngắn hạn", real: { winIn10: 1, winMult: 1.5, loseMult: 0.2, loseWhy: "cổ phiếu biến động cực mạnh, giảm sâu sau đỉnh ngắn hạn", explain: "VinFast biến động rất mạnh trong các tuần đầu sau niêm yết Nasdaq tháng 8/2023." } },
];

export const EVENTS: EventStat[] = [
  {
    id: "e-wedding", icon: "💍", title: "Đám cưới", story: "Bạn tổ chức đám cưới — tốn một khoản nhưng cũng nhận tiền mừng.",
    options: [
      { id: "a", icon: "🎉", label: "Cưới lớn", money: -0.06, heart: 2 },
      { id: "b", icon: "🥂", label: "Cưới vừa", money: -0.03, heart: 1 },
      { id: "c", icon: "📝", label: "Đăng ký, mời cơm thân", money: 0, heart: 0 },
    ],
  },
  {
    id: "e-childbirth", icon: "👶", title: "Con chào đời", story: "Thêm một thành viên gia đình — chi phí nuôi con tăng dần.",
    options: [
      { id: "a", icon: "🧑‍🍼", label: "Thuê người giúp", money: -0.04, heart: 0 },
      { id: "b", icon: "👵", label: "Nhờ ông bà phụ", money: -0.02, heart: -1 },
      { id: "c", icon: "😮‍💨", label: "Tự xoay xở", money: 0, heart: -2 },
    ],
  },
  {
    id: "e-parent-illness", icon: "🏥", title: "Cha mẹ ốm", story: "Bạn lo viện phí cho cha mẹ.",
    options: [
      { id: "a", icon: "🏨", label: "Chuyển viện tuyến trên", money: -30_000_000, heart: 0 },
      { id: "b", icon: "🩺", label: "Viện tỉnh, tự thức đêm chăm", money: -10_000_000, heart: -2 },
      { id: "c", icon: "🙏", label: "Nhờ anh chị em lo", money: 0, heart: -3 },
    ],
  },
  {
    id: "e-bonus", icon: "🧧", title: "Thưởng Tết đậm", story: "Công việc thuận lợi, bạn nhận thưởng lớn.",
    options: [
      { id: "a", icon: "💼", label: "Giữ cả, đi làm từ mùng 4", money: 0.05, heart: 0 },
      { id: "b", icon: "🧧", label: "Biếu bố mẹ, về quê ăn Tết", money: 0.02, heart: 1 },
      { id: "c", icon: "✈️", label: "Cả nhà đi du lịch", money: 0, heart: 2 },
    ],
  },
  {
    id: "e-scam", icon: "😓", title: "Bị lừa góp vốn", story: "Một người quen rủ góp vốn làm ăn — hoá ra là lừa đảo.",
    options: [
      { id: "a", icon: "⚖️", label: "Theo kiện tới cùng", money: -0.04, heart: -3 },
      { id: "b", icon: "📘", label: "Coi như học phí", money: -0.08, heart: -1 },
      { id: "c", icon: "🛌", label: "Nghỉ một tháng cho nguôi", money: -0.1, heart: 0 },
    ],
  },
  {
    id: "e-crisis", icon: "💥", title: "Khủng hoảng ập đến", story: "Thị trường chung hoảng loạn, tài sản bốc hơi một phần.",
    options: [
      { id: "a", icon: "💪", label: "Làm thêm bù lỗ", money: -0.05, heart: -3 },
      { id: "b", icon: "⏳", label: "Gồng chờ hồi", money: -0.1, heart: -2 },
      { id: "c", icon: "✂️", label: "Cắt lỗ cho nhẹ đầu", money: -0.15, heart: 0 },
    ],
  },
];

export const ALL_CARDS: CardStat[] = [...MEMORY_CARDS, ...TRAP_CARDS];

