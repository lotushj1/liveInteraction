import { Header } from "@/components/landing/Header";
import { Footer } from "@/components/landing/Footer";
import { Card, CardContent } from "@/components/ui/card";

const Terms = () => {
  return (
    <div className="min-h-screen">
      <Header />

      {/* Hero Section */}
      <section className="gradient-hero relative overflow-hidden py-20">
        <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:50px_50px]" />
        <div className="container relative mx-auto px-4">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="mb-4 text-4xl font-bold tracking-tight lg:text-5xl">
              服務條款
            </h1>
            <p className="text-lg text-muted-foreground">
              最後更新日期：2024 年 1 月 1 日
            </p>
          </div>
        </div>
      </section>

      {/* Content Section */}
      <section className="py-16 lg:py-24">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-4xl">
            <Card className="glass-card">
              <CardContent className="prose prose-slate dark:prose-invert max-w-none p-8 lg:p-12">

                <div className="mb-8 rounded-lg bg-primary/10 p-6 border-l-4 border-l-primary">
                  <p className="text-sm leading-relaxed m-0">
                    歡迎使用 LivePulse（以下簡稱「本平台」、「我們」）。使用本平台前，請詳細閱讀以下服務條款。當您註冊帳號或使用本平台任何服務時，即表示您已閱讀、了解並同意接受本服務條款的所有內容及其後續修改。
                  </p>
                </div>

                <h2 className="text-2xl font-bold mb-4 mt-8">一、服務說明</h2>

                <h3 className="text-xl font-semibold mb-3 mt-6">1.1 服務內容</h3>
                <p>LivePulse 提供即時現場互動平台服務，包括但不限於：</p>
                <ul>
                  <li>問答競賽（Quiz）功能</li>
                  <li>觀眾提問（Q&A）功能</li>
                  <li>即時投票（Poll）功能</li>
                  <li>展示畫面管理</li>
                  <li>參與者管理</li>
                  <li>數據統計與分析</li>
                </ul>

                <h3 className="text-xl font-semibold mb-3 mt-6">1.2 服務變更</h3>
                <p>
                  我們保留隨時修改、暫停或終止全部或部分服務的權利，恕不另行通知。我們將盡力提前公告重大變更，但不對服務中斷或變更承擔責任。
                </p>

                <h2 className="text-2xl font-bold mb-4 mt-8">二、帳號註冊與使用</h2>

                <h3 className="text-xl font-semibold mb-3 mt-6">2.1 註冊資格</h3>
                <ul>
                  <li>您必須年滿 18 歲或在監護人同意下使用本服務</li>
                  <li>您提供的註冊資料必須真實、準確且完整</li>
                  <li>每位使用者僅能註冊一個帳號</li>
                  <li>您有責任維護帳號資訊的正確性</li>
                </ul>

                <h3 className="text-xl font-semibold mb-3 mt-6">2.2 帳號安全</h3>
                <ul>
                  <li>您有責任妥善保管帳號密碼</li>
                  <li>不得將帳號提供給他人使用或轉讓</li>
                  <li>如發現帳號遭未經授權使用，應立即通知我們</li>
                  <li>您需為您帳號下的所有活動負責</li>
                </ul>

                <h3 className="text-xl font-semibold mb-3 mt-6">2.3 帳號終止</h3>
                <p>在以下情況下，我們有權暫停或終止您的帳號：</p>
                <ul>
                  <li>違反本服務條款</li>
                  <li>提供虛假資訊</li>
                  <li>從事非法活動或侵害他人權益</li>
                  <li>長期未使用（超過 12 個月）</li>
                  <li>您主動要求刪除帳號</li>
                </ul>

                <h2 className="text-2xl font-bold mb-4 mt-8">三、使用規範</h2>

                <h3 className="text-xl font-semibold mb-3 mt-6">3.1 禁止行為</h3>
                <p>使用本平台時，您同意不會：</p>
                <ul>
                  <li>上傳或發布違法、有害、威脅、辱罵、騷擾、誹謗、淫穢或其他不當內容</li>
                  <li>侵犯他人的智慧財產權、隱私權或其他權利</li>
                  <li>進行任何可能損害、中斷或破壞本平台的行為</li>
                  <li>使用自動化工具或機器人進行非授權存取</li>
                  <li>收集或儲存他人的個人資料</li>
                  <li>試圖繞過任何安全措施或存取限制</li>
                  <li>散佈病毒、惡意軟體或其他有害程式碼</li>
                  <li>冒充他人或虛假陳述與他人的關係</li>
                </ul>

                <h3 className="text-xl font-semibold mb-3 mt-6">3.2 內容規範</h3>
                <ul>
                  <li>您對您上傳或發布的內容負完全責任</li>
                  <li>我們保留審查、編輯或刪除不當內容的權利</li>
                  <li>您授予我們使用、展示和傳播您發布內容的權利</li>
                  <li>您保證擁有所發布內容的合法權利</li>
                </ul>

                <h2 className="text-2xl font-bold mb-4 mt-8">四、費用與付款</h2>

                <h3 className="text-xl font-semibold mb-3 mt-6">4.1 付費方案</h3>
                <ul>
                  <li>本平台提供免費版和付費版方案</li>
                  <li>付費方案的具體內容和價格請參閱價格頁面</li>
                  <li>我們保留隨時調整價格的權利，但不影響已購買的方案</li>
                </ul>

                <h3 className="text-xl font-semibold mb-3 mt-6">4.2 付款條件</h3>
                <ul>
                  <li>採用月付或年付制，需提前支付</li>
                  <li>付款方式包括信用卡、第三方支付等</li>
                  <li>未按時付款可能導致服務暫停</li>
                  <li>所有費用均以新台幣計價，含稅</li>
                </ul>

                <h3 className="text-xl font-semibold mb-3 mt-6">4.3 退款政策</h3>
                <ul>
                  <li>訂閱付費後 7 天內可申請全額退款</li>
                  <li>超過 7 天後，當期已支付費用恕不退還</li>
                  <li>您可隨時取消訂閱，但不影響當期使用權限</li>
                  <li>因違反條款被終止帳號者，不適用退款政策</li>
                </ul>

                <h2 className="text-2xl font-bold mb-4 mt-8">五、智慧財產權</h2>

                <h3 className="text-xl font-semibold mb-3 mt-6">5.1 平台權利</h3>
                <p>
                  本平台的所有內容，包括但不限於文字、圖片、標誌、程式碼、設計等，均受著作權、商標權及其他智慧財產權法律保護。未經授權，不得複製、修改、發布或用於商業目的。
                </p>

                <h3 className="text-xl font-semibold mb-3 mt-6">5.2 使用者內容</h3>
                <ul>
                  <li>您保留對您創建內容的所有權</li>
                  <li>您授予我們非專屬、全球性、免費的使用許可</li>
                  <li>此許可僅用於提供和改善服務</li>
                  <li>帳號刪除後，您的內容將在 30 天內移除</li>
                </ul>

                <h2 className="text-2xl font-bold mb-4 mt-8">六、免責聲明</h2>

                <h3 className="text-xl font-semibold mb-3 mt-6">6.1 服務提供</h3>
                <ul>
                  <li>服務按「現狀」提供，不提供任何明示或暗示的保證</li>
                  <li>我們不保證服務的不中斷、無錯誤或完全安全</li>
                  <li>我們不對使用者內容的準確性、完整性或合法性負責</li>
                </ul>

                <h3 className="text-xl font-semibold mb-3 mt-6">6.2 責任限制</h3>
                <p>
                  在法律允許的最大範圍內，我們對以下情況不承擔責任：
                </p>
                <ul>
                  <li>因使用或無法使用本服務造成的直接、間接、附帶或衍生損失</li>
                  <li>資料遺失、業務中斷或利潤損失</li>
                  <li>第三方的行為或內容</li>
                  <li>不可抗力因素（天災、戰爭、政府行為等）</li>
                </ul>

                <p className="mt-4">
                  在任何情況下，我們的總賠償責任不超過您在過去 12 個月內支付給我們的費用。
                </p>

                <h2 className="text-2xl font-bold mb-4 mt-8">七、隱私保護</h2>

                <p>
                  我們重視您的隱私權。關於個人資料的收集、使用和保護，請參閱我們的
                  <a href="/privacy" className="text-primary hover:underline mx-1">隱私權政策</a>
                  。使用本服務即表示您同意我們依隱私權政策處理您的個人資料。
                </p>

                <h2 className="text-2xl font-bold mb-4 mt-8">八、條款變更</h2>

                <p>
                  我們保留隨時修改本服務條款的權利。重大變更時，我們將透過以下方式通知您：
                </p>
                <ul>
                  <li>在平台上發布公告</li>
                  <li>透過電子郵件通知</li>
                  <li>登入時顯示更新提示</li>
                </ul>

                <p className="mt-4">
                  變更後繼續使用本服務，即表示您接受修改後的條款。如不同意變更，您應停止使用本服務並刪除帳號。
                </p>

                <h2 className="text-2xl font-bold mb-4 mt-8">九、終止服務</h2>

                <h3 className="text-xl font-semibold mb-3 mt-6">9.1 您的終止權</h3>
                <p>
                  您可隨時停止使用本服務並刪除帳號。刪除帳號後，您的資料將依隱私權政策處理。
                </p>

                <h3 className="text-xl font-semibold mb-3 mt-6">9.2 我們的終止權</h3>
                <p>
                  如您違反本條款，我們有權立即暫停或終止您的帳號，且不退還任何費用。
                </p>

                <h2 className="text-2xl font-bold mb-4 mt-8">十、爭議解決</h2>

                <h3 className="text-xl font-semibold mb-3 mt-6">10.1 準據法</h3>
                <p>
                  本服務條款之解釋與適用，以及與本服務條款有關的爭議，均應依照中華民國法律處理。
                </p>

                <h3 className="text-xl font-semibold mb-3 mt-6">10.2 管轄法院</h3>
                <p>
                  因本服務條款所生之爭議，雙方同意以台灣台北地方法院為第一審管轄法院。
                </p>

                <h3 className="text-xl font-semibold mb-3 mt-6">10.3 爭議處理</h3>
                <p>
                  發生爭議時，我們鼓勵雙方先透過友好協商解決。如協商不成，再依上述管轄法院處理。
                </p>

                <h2 className="text-2xl font-bold mb-4 mt-8">十一、其他條款</h2>

                <h3 className="text-xl font-semibold mb-3 mt-6">11.1 完整協議</h3>
                <p>
                  本服務條款與隱私權政策構成您與我們之間的完整協議，取代所有先前的口頭或書面協議。
                </p>

                <h3 className="text-xl font-semibold mb-3 mt-6">11.2 可分割性</h3>
                <p>
                  如本條款任何條文被認定無效或無法執行，其餘條文仍然有效。
                </p>

                <h3 className="text-xl font-semibold mb-3 mt-6">11.3 不放棄權利</h3>
                <p>
                  我們未行使或延遲行使本條款下的任何權利，不構成對該權利的放棄。
                </p>

                <h2 className="text-2xl font-bold mb-4 mt-8">十二、聯絡我們</h2>

                <p>
                  如對本服務條款有任何疑問或建議，請透過以下方式聯絡我們：
                </p>
                <ul>
                  <li>客服信箱：<a href="mailto:support@livepulse.com" className="text-primary hover:underline">support@livepulse.com</a></li>
                  <li>法務信箱：<a href="mailto:legal@livepulse.com" className="text-primary hover:underline">legal@livepulse.com</a></li>
                </ul>

                <div className="mt-12 pt-8 border-t border-border">
                  <p className="text-sm text-muted-foreground">
                    本服務條款最後更新於 2024 年 1 月 1 日。感謝您選擇使用 LivePulse，我們致力於為您提供最佳的互動體驗！
                  </p>
                </div>

              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Terms;
