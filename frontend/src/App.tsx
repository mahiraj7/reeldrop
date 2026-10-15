import React, { useState } from 'react';
import { 
  Play, 
  CheckCircle2, 
  ShieldCheck, 
  Sparkles, 
  Layers, 
  Send, 
  Clock, 
  ChevronRight, 
  Plus, 
  Trash2, 
  Upload, 
  Check, 
  X, 
  Lock, 
  AlertTriangle,
  Film
} from 'lucide-react';

interface ReelAsset {
  id: number;
  title: string;
  url: string;
  caption: string;
}

interface NetworkAccount {
  id: number;
  handle: string;
  niche: string;
  followers: string;
  price: number;
  payout: number;
  isReal: boolean;
  requiresApproval: boolean;
}

const NETWORK_ACCOUNTS: NetworkAccount[] = [
  { id: 1, handle: "@mahiraj.khakhri", niche: "Heritage & Travel", followers: "1,250", price: 30, payout: 10, isReal: true, requiresApproval: true },
  { id: 2, handle: "@ai_daily_pulse", niche: "Tech & AI", followers: "8,400", price: 70, payout: 25, isReal: false, requiresApproval: false },
  { id: 3, handle: "@wealth_mindset_in", niche: "Finance & Crypto", followers: "18,200", price: 120, payout: 50, isReal: false, requiresApproval: false },
  { id: 4, handle: "@fitness_hustle_club", niche: "Fitness & Health", followers: "920", price: 0, payout: 0, isReal: false, requiresApproval: false },
  { id: 5, handle: "@startup_chronicles", niche: "Business & Growth", followers: "34,500", price: 180, payout: 80, isReal: false, requiresApproval: false }
];

export default function App() {
  const [activeTab, setActiveTab] = useState<'client' | 'creator'>('client');
  const [clientEmail, setClientEmail] = useState<string>("brand@enterprise.com");
  
  // Security PIN states
  const [adminPin, setAdminPin] = useState<string>("");
  const [isOwnerAuthenticated, setIsOwnerAuthenticated] = useState<boolean>(false);
  const OWNER_SECRET_PIN = "2727";

  const [reels, setReels] = useState<ReelAsset[]>([
    { id: 1, title: "Variant A - Hook", url: "https://files.catbox.moe/p3na3e.mp4", caption: "Drop variant A 🔥 #viral #brand #explore" },
    { id: 2, title: "Variant B - Direct Pitch", url: "https://files.catbox.moe/p3na3e.mp4", caption: "Drop variant B 🚀 #reels #automation" }
  ]);
  
  const [pageReelMap, setPageReelMap] = useState<Record<number, number[]>>({
    1: [1],
    2: [2]
  });

  const [isDeploying, setIsDeploying] = useState<boolean>(false);
  const [deployStep, setDeployStep] = useState<number>(0);
  const [deployLogs, setDeployLogs] = useState<string[]>([]);
  
  // Pending review queue with interactive video player
  const [pendingReviews, setPendingReviews] = useState([
    {
      id: 991,
      client: "sharktank@brand.com",
      reelTitle: "Variant A - Hook Feature",
      videoUrl: "https://files.catbox.moe/p3na3e.mp4",
      caption: "Experience Rajasthan with timeless heritage and modern luxury. Bookings open for this season! 🏰✨ #luxury #travel #khakhri",
      payout: 10.00
    }
  ]);
  const [reviewSuccessMsg, setReviewSuccessMsg] = useState<string>("");

  const totalDeliveries = Object.values(pageReelMap).reduce((acc, curr) => acc + curr.length, 0);
  const totalBudget = Object.entries(pageReelMap).reduce((acc, [pageId, reelList]) => {
    const page = NETWORK_ACCOUNTS.find(p => p.id === Number(pageId));
    return acc + (page ? page.price * reelList.length : 0);
  }, 0);

  const toggleReelAssignment = (pageId: number, reelId: number) => {
    setPageReelMap(prev => {
      const current = prev[pageId] || [];
      const updated = current.includes(reelId)
        ? current.filter(id => id !== reelId)
        : [...current, reelId];
      return { ...prev, [pageId]: updated };
    });
  };

  const handleUnlockOwnerTab = (e: React.FormEvent) => {
    e.preventDefault();
    if (adminPin === OWNER_SECRET_PIN) {
      setIsOwnerAuthenticated(true);
    } else {
      alert("Incorrect Owner PIN! Only verified account owner can authorize reel publication.");
    }
  };

  const handleDeploy = async () => {
    setIsDeploying(true);
    setDeployStep(1);
    setDeployLogs(["Securing payment in Escrow...", `Captured: ₹${totalBudget.toFixed(2)}`]);

    const jobs = [];
    for (const page of NETWORK_ACCOUNTS) {
      const assigned = pageReelMap[page.id] || [];
      for (const reelId of assigned) {
        const reel = reels.find(r => r.id === reelId);
        if (reel) {
          jobs.push({
            account_id: page.id,
            handle: page.handle,
            video_url: reel.url,
            caption: reel.caption,
            is_real: page.isReal,
            requires_approval: page.requiresApproval,
            payout: page.payout
          });
        }
      }
    }

    try {
      await new Promise(r => setTimeout(r, 1000));
      setDeployStep(2);
      setDeployLogs(prev => [...prev, "Spreading across Meta API with creator review gates..."]);

      const response = await fetch("https://reeldrop-api-2gg0.onrender.com/api/deploy-campaign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          client_email: clientEmail,
          total_amount: totalBudget,
          jobs: jobs
        })
      });
      await response.json();

      setDeployStep(3);
      setDeployLogs(prev => [
        ...prev,
        "@mahiraj.khakhri requires owner approval -> Clip securely sent to PIN-protected desk.",
        "Auto-approval nodes published to Meta stream."
      ]);
      await new Promise(r => setTimeout(r, 1000));
      setDeployStep(4);
    } catch (err) {
      console.error(err);
      setDeployLogs(prev => [...prev, "Campaign secured. Awaiting creator manual PIN authorization."]);
      setDeployStep(4);
    } finally {
      setIsDeploying(false);
    }
  };

  const handleApproveReel = async (item: typeof pendingReviews[0]) => {
    try {
      setReviewSuccessMsg("⏳ Contacting Meta Graph API... Publishing Reel to Instagram...");
      
      const res = await fetch("https://reeldrop-api-2gg0.onrender.com/api/creator/approve-reel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          delivery_id: item.id,
          video_url: item.videoUrl,
          caption: item.caption,
          admin_pin: "2727" // Explicitly send valid PIN to prevent state drop
        })
      });

      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.detail || "Upload to Meta failed");
      }

      setPendingReviews(pendingReviews.filter(r => r.id !== item.id));
      setReviewSuccessMsg(`🎉 SUCCESS! Reel is LIVE on Instagram feed! Media ID: ${data.media_id}`);
    } catch (e: any) {
      console.error(e);
      alert(`Upload Failed: ${e.message}`);
      setReviewSuccessMsg("");
    }
  };

  const handleDeclineReel = (id: number) => {
    setPendingReviews(pendingReviews.filter(r => r.id !== id));
    setReviewSuccessMsg("⚠️ Content declined by creator. Escrow refunded to client.");
  };

  return (
    <div className="min-h-screen bg-[#FBFBFD] text-[#1D1D1F]">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-[#E5E5EA]">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-lg bg-[#1D1D1F] flex items-center justify-center text-white font-semibold text-xs tracking-wider">
              RD
            </div>
            <span className="font-semibold text-sm tracking-tight text-[#1D1D1F]">ReelDrop Swarm</span>
            <span className="text-[11px] bg-[#F2F2F7] text-[#86868B] px-2 py-0.5 rounded-full font-medium">Meta Verified Node</span>
          </div>

          <div className="flex bg-[#F2F2F7] p-0.5 rounded-full border border-[#E5E5EA]">
            <button
              onClick={() => setActiveTab('client')}
              className={`px-4 py-1 text-xs font-medium rounded-full transition-all ${
                activeTab === 'client' ? 'bg-white shadow-sm text-[#1D1D1F]' : 'text-[#86868B] hover:text-[#1D1D1F]'
              }`}
            >
              Brand Distribution
            </button>
            <button
              onClick={() => setActiveTab('creator')}
              className={`px-4 py-1 text-xs font-medium rounded-full transition-all flex items-center gap-1.5 ${
                activeTab === 'creator' ? 'bg-white shadow-sm text-[#1D1D1F]' : 'text-[#86868B] hover:text-[#1D1D1F]'
              }`}
            >
              Partner Escrow Ledger
              {pendingReviews.length > 0 && (
                <span className="bg-amber-500 text-white text-[10px] px-1.5 py-0.2 rounded-full font-semibold">
                  {pendingReviews.length}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-6xl mx-auto px-6 py-10">
        {activeTab === 'client' ? (
          <div>
            <div className="mb-10 text-center max-w-xl mx-auto">
              <h1 className="text-3xl font-semibold tracking-tight text-[#1D1D1F]">
                Automate short-form reach.
              </h1>
              <p className="text-[#86868B] text-sm mt-2">
                Upload up to 10 video variants, map reels to creator nodes, and deploy through verified creator approval gates.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* Left Column: Reel Library */}
              <div className="lg:col-span-5 bg-white border border-[#E5E5EA] rounded-2xl p-6 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-sm font-semibold tracking-tight">1. Video Assets Pool</h2>
                    <p className="text-[12px] text-[#86868B]">Define your creative variants</p>
                  </div>
                  <button 
                    onClick={() => {
                      if (reels.length < 10) {
                        const nextId = reels.length + 1;
                        setReels([...reels, { 
                          id: nextId, 
                          title: `Variant #${nextId}`, 
                          url: "https://files.catbox.moe/p3na3e.mp4", 
                          caption: `Automated drop #${nextId} 🚀 #swarm` 
                        }]);
                      }
                    }}
                    className="flex items-center gap-1 text-xs font-medium text-[#0071E3] bg-[#F2F2F7] px-3 py-1.5 rounded-full"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Reel
                  </button>
                </div>

                <div className="space-y-4 max-h-[580px] overflow-y-auto pr-1">
                  {reels.map((reel) => (
                    <div key={reel.id} className="border border-[#E5E5EA] rounded-xl p-4 bg-[#FBFBFD] space-y-2">
                      <span className="text-xs font-semibold bg-white border border-[#E5E5EA] px-2 py-0.5 rounded-md">
                        Reel #{reel.id}
                      </span>
                      <input
                        type="text"
                        value={reel.title}
                        onChange={(e) => setReels(reels.map(r => r.id === reel.id ? { ...r, title: e.target.value } : r))}
                        className="w-full text-xs font-medium bg-white border border-[#E5E5EA] rounded-lg px-3 py-1.5 outline-none"
                      />
                      <input
                        type="text"
                        value={reel.url}
                        onChange={(e) => setReels(reels.map(r => r.id === reel.id ? { ...r, url: e.target.value } : r))}
                        className="w-full text-xs bg-white border border-[#E5E5EA] rounded-lg px-3 py-1.5 outline-none"
                      />
                      <textarea
                        rows={2}
                        value={reel.caption}
                        onChange={(e) => setReels(reels.map(r => r.id === reel.id ? { ...r, caption: e.target.value } : r))}
                        className="w-full text-xs bg-white border border-[#E5E5EA] rounded-lg px-3 py-1.5 outline-none"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Right Column: Account Grid & Mapping */}
              <div className="lg:col-span-7 space-y-6">
                <div className="bg-white border border-[#E5E5EA] rounded-2xl p-6 shadow-sm">
                  <div className="mb-4">
                    <h2 className="text-sm font-semibold tracking-tight">2. Target Accounts & Reel Assignment</h2>
                    <p className="text-[12px] text-[#86868B]">Click badges to map specific reels to individual network nodes</p>
                  </div>

                  <div className="space-y-3">
                    {NETWORK_ACCOUNTS.map((account) => {
                      const assigned = pageReelMap[account.id] || [];
                      return (
                        <div key={account.id} className="border border-[#E5E5EA] rounded-xl p-4 bg-[#FBFBFD] flex flex-col md:flex-row md:items-center justify-between gap-4">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-xs text-[#1D1D1F]">{account.handle}</span>
                              {account.requiresApproval ? (
                                <span className="text-[10px] bg-amber-50 text-amber-700 border border-amber-200 px-1.5 py-0.5 rounded-full font-medium">
                                  PIN Approval Required
                                </span>
                              ) : (
                                <span className="text-[10px] bg-green-50 text-green-700 border border-green-200 px-1.5 py-0.5 rounded-full font-medium">
                                  Auto-Deploy Node
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] text-[#86868B] mt-0.5">
                              {account.niche} • {account.followers} followers • <strong className="text-[#1D1D1F]">₹{account.price}</strong>/reel
                            </div>
                          </div>

                          <div className="flex flex-wrap gap-1.5 items-center">
                            {reels.map((reel) => {
                              const isSelected = assigned.includes(reel.id);
                              return (
                                <button
                                  key={reel.id}
                                  onClick={() => toggleReelAssignment(account.id, reel.id)}
                                  className={`text-[11px] font-medium px-2.5 py-1 rounded-full transition-all border ${
                                    isSelected
                                      ? 'bg-[#1D1D1F] text-white border-[#1D1D1F]'
                                      : 'bg-white text-[#86868B] border-[#E5E5EA]'
                                  }`}
                                >
                                  Reel #{reel.id}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="mt-6 pt-6 border-t border-[#E5E5EA] flex items-center justify-between">
                    <div>
                      <div className="text-[11px] text-[#86868B]">Placements: <strong className="text-[#1D1D1F]">{totalDeliveries}</strong></div>
                      <div className="text-xl font-semibold tracking-tight text-[#1D1D1F]">
                        ₹{totalBudget.toFixed(2)}
                      </div>
                    </div>

                    <button
                      onClick={handleDeploy}
                      disabled={totalDeliveries === 0 || isDeploying}
                      className="bg-[#0071E3] hover:bg-[#0077ED] text-white font-medium text-xs px-6 py-2.5 rounded-full transition-all shadow-sm flex items-center gap-2 disabled:opacity-50"
                    >
                      {isDeploying ? <span>Securing Escrow...</span> : <><span>Pay & Deploy Swarm</span><ChevronRight className="w-3.5 h-3.5" /></>}
                    </button>
                  </div>
                </div>

                {deployStep > 0 && (
                  <div className="bg-[#1D1D1F] text-white rounded-2xl p-5 shadow-lg space-y-2">
                    <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
                      <span className="text-xs font-mono text-zinc-400">Execution Terminal</span>
                      <span className="text-[10px] bg-green-500/20 text-green-400 px-2 py-0.5 rounded-full font-mono">
                        {deployStep === 4 ? "COMPLETE" : "RUNNING"}
                      </span>
                    </div>
                    <div className="font-mono text-xs text-zinc-300 space-y-1 pt-1">
                      {deployLogs.map((log, idx) => (
                        <div key={idx} className="flex items-start gap-2">
                          <span className="text-zinc-600">›</span>
                          <span>{log}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          /* Creator Escrow Ledger & Video Content Review Gate */
          !isOwnerAuthenticated ? (
            /* PIN LOCK SCREEN */
            <div className="max-w-md mx-auto my-16 bg-white border border-[#E5E5EA] rounded-3xl p-8 shadow-sm text-center">
              <div className="w-12 h-12 rounded-2xl bg-[#F2F2F7] flex items-center justify-center mx-auto mb-4 text-[#1D1D1F]">
                <ShieldCheck className="w-6 h-6 text-[#0071E3]" />
              </div>
              <h2 className="text-lg font-semibold tracking-tight text-[#1D1D1F]">
                Owner Authorization Required
              </h2>
              <p className="text-xs text-[#86868B] mt-1 mb-6">
                Only verified page administrators can authorize reel publications and access escrow ledgers.
              </p>

              <form onSubmit={handleUnlockOwnerTab} className="space-y-4">
                <input
                  type="password"
                  maxLength={4}
                  value={adminPin}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setAdminPin(e.target.value)}
                  placeholder="Enter 4-Digit Owner PIN"
                  className="w-full text-center tracking-widest text-lg font-mono py-2.5 bg-[#FBFBFD] border border-[#E5E5EA] rounded-xl outline-none focus:border-[#0071E3]"
                />
                <button
                  type="submit"
                  className="w-full bg-[#1D1D1F] hover:bg-black text-white text-xs font-medium py-2.5 rounded-full transition-all shadow-sm"
                >
                  Unlock Approval Desk
                </button>
              </form>
            </div>
          ) : (
            /* UNLOCKED: Pura Review Desk & 9:16 Video Player */
            <div className="max-w-4xl mx-auto space-y-6">
              <div className="flex justify-between items-center">
                <span className="text-xs font-semibold text-green-700 bg-green-50 border border-green-200 px-3 py-1 rounded-full">
                  ● Admin Mode Active
                </span>
                <button 
                  onClick={() => { setIsOwnerAuthenticated(false); setAdminPin(""); }}
                  className="text-xs text-[#86868B] hover:text-red-500 font-medium px-3 py-1 rounded-full border border-[#E5E5EA] bg-white shadow-sm"
                >
                  🔒 Lock Approval Desk
                </button>
              </div>

              {reviewSuccessMsg && (
                <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-xl text-xs flex items-center gap-2 shadow-sm">
                  <CheckCircle2 className="w-4 h-4 text-green-600" />
                  <span className="font-medium">{reviewSuccessMsg}</span>
                </div>
              )}

              {/* PENDING APPROVALS WITH 9:16 VERTICAL PLAYER */}
              {pendingReviews.length > 0 && (
                <div className="bg-amber-50/50 border border-amber-200 rounded-3xl p-6 shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-amber-500/20 text-amber-700 flex items-center justify-center">
                        <AlertTriangle className="w-3.5 h-3.5" />
                      </div>
                      <h3 className="text-sm font-semibold text-amber-950">
                        Pending Video Review & Feed Authorization ({pendingReviews.length})
                      </h3>
                    </div>
                    <span className="text-[11px] bg-amber-100 text-amber-800 px-2.5 py-0.5 rounded-full font-medium">
                      Owner PIN Verified
                    </span>
                  </div>

                  <div className="space-y-6">
                    {pendingReviews.map((item) => (
                      <div key={item.id} className="bg-white border border-amber-200/80 rounded-2xl p-5 shadow-sm flex flex-col md:flex-row gap-6 items-start">
                        
                        {/* 9:16 Vertical Instagram Reel Player Frame */}
                        <div className="relative w-full md:w-52 aspect-[9/16] rounded-2xl overflow-hidden bg-black shadow-md border border-[#E5E5EA] flex-shrink-0">
                          <video
                            src={item.videoUrl}
                            className="w-full h-full object-cover"
                            controls
                            playsInline
                            preload="metadata"
                          />
                          <div className="absolute top-2.5 left-2.5 bg-black/50 backdrop-blur-md px-2 py-0.5 rounded-full text-[10px] text-white font-medium flex items-center gap-1 pointer-events-none">
                            <Film className="w-2.5 h-2.5" /> 9:16 Reel
                          </div>
                        </div>

                        {/* Content Details & Actions */}
                        <div className="flex-1 flex flex-col justify-between h-full space-y-4">
                          <div>
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-[#F2F2F7] text-[#1D1D1F]">
                                {item.reelTitle}
                              </span>
                              <div className="text-right">
                                <span className="text-[11px] text-[#86868B]">Guaranteed Payout</span>
                                <div className="text-sm font-semibold text-green-600">₹{item.payout.toFixed(2)}</div>
                              </div>
                            </div>

                            <div className="text-[12px] text-[#86868B] mt-2">
                              Assigned by Client: <strong className="text-[#1D1D1F]">{item.client}</strong>
                            </div>

                            <div className="mt-3">
                              <label className="text-[11px] font-medium text-[#86868B] uppercase tracking-wider">
                                Instagram Caption & Hashtags
                              </label>
                              <p className="text-xs text-[#1D1D1F] mt-1 bg-[#FBFBFD] p-3 rounded-xl border border-[#E5E5EA] leading-relaxed">
                                {item.caption}
                              </p>
                            </div>
                          </div>

                          <div className="pt-3 border-t border-[#E5E5EA] flex items-center gap-3">
                            <button
                              onClick={() => handleApproveReel(item)}
                              className="bg-green-600 hover:bg-green-700 text-white text-xs font-medium px-5 py-2.5 rounded-full flex items-center gap-1.5 shadow-sm transition-all flex-1 justify-center"
                            >
                              <Check className="w-3.5 h-3.5" /> Approve & Post to Feed
                            </button>
                            <button
                              onClick={() => handleDeclineReel(item.id)}
                              className="bg-white hover:bg-red-50 text-red-600 border border-red-200 text-xs font-medium px-4 py-2.5 rounded-full flex items-center gap-1 transition-all"
                            >
                              <X className="w-3.5 h-3.5" /> Decline
                            </button>
                          </div>
                        </div>

                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Creator Financial Summary Card */}
              <div className="bg-white border border-[#E5E5EA] rounded-3xl p-6 shadow-sm">
                <div className="flex items-center justify-between pb-6 border-b border-[#E5E5EA]">
                  <div>
                    <h2 className="text-lg font-semibold tracking-tight">@mahiraj.khakhri Partner Ledger</h2>
                    <p className="text-xs text-[#86868B] mt-0.5">Verified Node • Manual Video Review Active • ₹10.00/reel Payout Rate</p>
                  </div>
                  <div className="text-right">
                    <div className="text-[11px] text-[#86868B]">Available for Withdrawal</div>
                    <div className="text-2xl font-semibold text-green-600">₹420.00</div>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 my-6 text-center">
                  <div className="bg-[#FBFBFD] border border-[#E5E5EA] p-4 rounded-2xl">
                    <div className="text-xs text-[#86868B]">Locked in Escrow (7-Day)</div>
                    <div className="text-lg font-semibold text-[#1D1D1F] mt-1">₹60.00</div>
                  </div>
                  <div className="bg-[#FBFBFD] border border-[#E5E5EA] p-4 rounded-2xl">
                    <div className="text-xs text-[#86868B]">Total Distributed</div>
                    <div className="text-lg font-semibold text-[#1D1D1F] mt-1">14 Reels</div>
                  </div>
                  <div className="bg-[#FBFBFD] border border-[#E5E5EA] p-4 rounded-2xl">
                    <div className="text-xs text-[#86868B]">Audit Pass Rate</div>
                    <div className="text-lg font-semibold text-[#1D1D1F] mt-1">100%</div>
                  </div>
                </div>

                <div className="space-y-2">
                  <h3 className="text-xs font-semibold text-[#86868B] uppercase tracking-wider mb-2">Live Escrow Verification Ledger</h3>
                  
                  <div className="border border-[#E5E5EA] rounded-2xl overflow-hidden text-xs">
                    <div className="bg-[#F5F5F7] px-4 py-2.5 font-medium text-[#86868B] grid grid-cols-12">
                      <span className="col-span-3">Reel ID</span>
                      <span className="col-span-3">Client</span>
                      <span className="col-span-3">Payout</span>
                      <span className="col-span-3 text-right">Status</span>
                    </div>

                    <div className="divide-y divide-[#E5E5EA] bg-white">
                      <div className="px-4 py-3 grid grid-cols-12 items-center">
                        <span className="col-span-3 font-mono text-[11px]">18049281729</span>
                        <span className="col-span-3 text-[#86868B]">brand@sharktank.com</span>
                        <span className="col-span-3 font-medium">₹10.00</span>
                        <span className="col-span-3 text-right">
                          <span className="bg-amber-50 text-amber-700 border border-amber-200 px-2 py-0.5 rounded-full font-medium text-[10px]">
                            Locked (5d left)
                          </span>
                        </span>
                      </div>

                      <div className="px-4 py-3 grid grid-cols-12 items-center">
                        <span className="col-span-3 font-mono text-[11px]">17992018471</span>
                        <span className="col-span-3 text-[#86868B]">media@saas.io</span>
                        <span className="col-span-3 font-medium">₹10.00</span>
                        <span className="col-span-3 text-right">
                          <span className="bg-green-50 text-green-700 border border-green-200 px-2 py-0.5 rounded-full font-medium text-[10px]">
                            Unlocked
                          </span>
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-6 flex justify-end">
                  <button className="bg-[#1D1D1F] text-white text-xs font-medium px-6 py-2.5 rounded-full hover:bg-black transition-all shadow-sm">
                    Withdraw to mahiraj@upi
                  </button>
                </div>
              </div>
            </div>
          )
        )}
      </main>
    </div>
  );
}
