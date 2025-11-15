import { Header } from "@/components/landing/Header";
import { Footer } from "@/components/landing/Footer";
import { Card, CardContent } from "@/components/ui/card";

const Privacy = () => {
  return (
    <div className="min-h-screen">
      <Header />

      {/* Hero Section */}
      <section className="gradient-hero relative overflow-hidden py-20">
        <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:50px_50px]" />
        <div className="container relative mx-auto px-4">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="mb-4 text-4xl font-bold tracking-tight lg:text-5xl">
              隱私權政策
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
                    LivePulse（以下簡稱「本平台」）非常重視您的隱私權。本隱私權政策說明我們如何收集、使用、揭露和保護您的個人資料。使用本平台即表示您同意本政策的條款。
                  </p>
                </div>

                <h2 className="text-2xl font-bold mb-4 mt-8">一、資料收集</h2>

                <h3 className="text-xl font-semibold mb-3 mt-6">1.1 我們收集的資料</h3>
                <p>當您使用本平台時，我們可能收集以下資料：</p>
                <ul>
                  <li><strong>帳戶資料</strong>：電子郵件地址、密碼（加密儲存）</li>
                  <li><strong>活動資料</strong>：您建立的活動資訊、問題、投票內容</li>
                  <li><strong>參與者資料</strong>：暱稱、參與時間、互動記錄</li>
                  <li><strong>使用資料</strong>：IP 位址、瀏覽器類型、裝置資訊、使用時間</li>
                  <li><strong>Cookie 資料</strong>：用於維持登入狀態和分析使用行為</li>
                </ul>

                <h3 className="text-xl font-semibold mb-3 mt-6">1.2 資料收集方式</h3>
                <ul>
                  <li>您主動提供的資料（註冊、建立活動、參與互動）</li>
                  <li>自動收集的技術資料（Cookies、日誌檔案）</li>
                  <li>第三方服務提供的資料（登入服務、分析工具）</li>
                </ul>

                <h2 className="text-2xl font-bold mb-4 mt-8">二、資料使用</h2>

                <h3 className="text-xl font-semibold mb-3 mt-6">2.1 使用目的</h3>
                <p>我們收集的資料將用於：</p>
                <ul>
                  <li><strong>提供服務</strong>：維護帳戶、執行活動、處理互動</li>
                  <li><strong>改善體驗</strong>：優化功能、個人化內容、分析使用趨勢</li>
                  <li><strong>安全維護</strong>：防止詐騙、保護系統安全、偵測異常活動</li>
                  <li><strong>客戶支援</strong>：回應詢問、解決問題、提供技術協助</li>
                  <li><strong>行銷溝通</strong>：發送產品更新、活動通知（您可隨時取消訂閱）</li>
                </ul>

                <h3 className="text-xl font-semibold mb-3 mt-6">2.2 合法依據</h3>
                <p>我們處理您的個人資料基於：</p>
                <ul>
                  <li>履行與您之間的服務契約</li>
                  <li>您的明確同意</li>
                  <li>遵守法律義務</li>
                  <li>保護您或他人的重大利益</li>
                  <li>我們的合法權益（在不侵害您權利的前提下）</li>
                </ul>

                <h2 className="text-2xl font-bold mb-4 mt-8">三、資料分享與揭露</h2>

                <h3 className="text-xl font-semibold mb-3 mt-6">3.1 資料分享對象</h3>
                <p>我們僅在必要時與以下對象分享您的資料：</p>
                <ul>
                  <li><strong>服務供應商</strong>：雲端儲存、資料分析、支付處理（均簽訂保密協議）</li>
                  <li><strong>活動主持人</strong>：參與者暱稱、互動內容（基於活動運作需求）</li>
                  <li><strong>法律要求</strong>：執法機關、法院或政府機關的合法要求</li>
                </ul>

                <h3 className="text-xl font-semibold mb-3 mt-6">3.2 不會分享的情況</h3>
                <ul>
                  <li>我們不會出售您的個人資料</li>
                  <li>我們不會將您的資料用於第三方廣告</li>
                  <li>未經您同意，不會分享敏感個人資料</li>
                </ul>

                <h2 className="text-2xl font-bold mb-4 mt-8">四、資料安全</h2>

                <h3 className="text-xl font-semibold mb-3 mt-6">4.1 安全措施</h3>
                <p>我們採取多層次的安全措施保護您的資料：</p>
                <ul>
                  <li><strong>加密技術</strong>：使用 SSL/TLS 加密傳輸，密碼採用雜湊加密儲存</li>
                  <li><strong>存取控制</strong>：限制員工存取權限，實施最小權限原則</li>
                  <li><strong>定期審查</strong>：定期進行安全稽核和漏洞掃描</li>
                  <li><strong>備份機制</strong>：定期備份資料，確保資料完整性</li>
                </ul>

                <h3 className="text-xl font-semibold mb-3 mt-6">4.2 資料保留</h3>
                <ul>
                  <li>帳戶資料：保留至帳戶刪除後 30 天</li>
                  <li>活動資料：保留至活動結束後 90 天（可由主持人延長）</li>
                  <li>日誌資料：保留 12 個月</li>
                </ul>

                <h2 className="text-2xl font-bold mb-4 mt-8">五、您的權利</h2>

                <p>根據相關法律，您擁有以下權利：</p>
                <ul>
                  <li><strong>存取權</strong>：查詢我們持有的您的個人資料</li>
                  <li><strong>更正權</strong>：要求更正不正確或不完整的資料</li>
                  <li><strong>刪除權</strong>：要求刪除您的個人資料（「被遺忘權」）</li>
                  <li><strong>限制處理權</strong>：限制我們處理您的資料</li>
                  <li><strong>資料可攜權</strong>：以結構化、常用格式取得您的資料</li>
                  <li><strong>反對權</strong>：反對基於合法權益的資料處理</li>
                  <li><strong>撤回同意權</strong>：隨時撤回您的同意（不影響撤回前的合法處理）</li>
                </ul>

                <p className="mt-4">
                  如需行使上述權利，請聯絡我們：
                  <a href="mailto:privacy@livepulse.com" className="text-primary hover:underline ml-2">
                    privacy@livepulse.com
                  </a>
                </p>

                <h2 className="text-2xl font-bold mb-4 mt-8">六、Cookie 政策</h2>

                <h3 className="text-xl font-semibold mb-3 mt-6">6.1 Cookie 使用</h3>
                <p>我們使用以下類型的 Cookie：</p>
                <ul>
                  <li><strong>必要 Cookie</strong>：維持登入狀態、記住偏好設定</li>
                  <li><strong>分析 Cookie</strong>：了解使用者行為、改善服務</li>
                  <li><strong>功能 Cookie</strong>：提供個人化體驗</li>
                </ul>

                <h3 className="text-xl font-semibold mb-3 mt-6">6.2 管理 Cookie</h3>
                <p>
                  您可以透過瀏覽器設定管理或刪除 Cookie。請注意，禁用 Cookie 可能影響部分功能的正常運作。
                </p>

                <h2 className="text-2xl font-bold mb-4 mt-8">七、兒童隱私</h2>

                <p>
                  本平台不針對 13 歲以下兒童。我們不會故意收集 13 歲以下兒童的個人資料。如發現誤收此類資料，我們將立即刪除。
                </p>

                <h2 className="text-2xl font-bold mb-4 mt-8">八、跨境資料傳輸</h2>

                <p>
                  您的資料可能儲存於台灣或其他國家/地區的伺服器。我們確保所有跨境傳輸符合適用法律，並採取適當保護措施。
                </p>

                <h2 className="text-2xl font-bold mb-4 mt-8">九、政策更新</h2>

                <p>
                  我們可能不時更新本隱私權政策。重大變更時，我們將透過電子郵件或平台公告通知您。繼續使用本平台即表示您接受更新後的政策。
                </p>

                <h2 className="text-2xl font-bold mb-4 mt-8">十、聯絡我們</h2>

                <p>
                  如對本隱私權政策有任何疑問或建議，請透過以下方式聯絡我們：
                </p>
                <ul>
                  <li>電子郵件：<a href="mailto:privacy@livepulse.com" className="text-primary hover:underline">privacy@livepulse.com</a></li>
                  <li>客服信箱：<a href="mailto:support@livepulse.com" className="text-primary hover:underline">support@livepulse.com</a></li>
                </ul>

                <div className="mt-12 pt-8 border-t border-border">
                  <p className="text-sm text-muted-foreground">
                    本隱私權政策最後更新於 2024 年 1 月 1 日。我們建議您定期查閱本頁面以了解最新資訊。
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

export default Privacy;
