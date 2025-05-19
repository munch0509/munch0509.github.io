"use client";
import React from "react";

import { useUpload } from "../utilities/runtime-helpers";

function MainComponent() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isAnimating, setIsAnimating] = useState(false);
  const [memos, setMemos] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedMemo, setSelectedMemo] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newContent, setNewContent] = useState("");
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [uploadedImage, setUploadedImage] = useState(null);
  const [upload, { loading: uploading }] = useUpload();
  const [theme, setTheme] = useState("pink");
  const [newPassword, setNewPassword] = useState("");
  const [activeTab, setActiveTab] = useState("list"); // 'list' or 'new'

  const handleLogin = async () => {
    try {
      const response = await fetch("/api/verify-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      if (response.ok) {
        setIsAnimating(true);
        setTimeout(() => {
          setIsAuthenticated(true);
          setError("");
          fetchMemos();
        }, 500);
      } else {
        setPassword("");
        setError("Incorrect password");
      }
    } catch (err) {
      setError("Authentication error");
      console.error(err);
    }
  };

  const handlePasswordChange = (e) => {
    const newPassword = e.target.value;
    setPassword(newPassword);
    if (newPassword.length === 4) {
      handleLogin();
    }
  };

  const fetchMemos = async () => {
    try {
      const response = await fetch("/api/memos", {
        method: "GET",
      });
      if (!response.ok) {
        throw new Error(`Error fetching memos: ${response.status}`);
      }
      const { data } = await response.json();
      setMemos(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("メモの取得に失敗しました:", err);
      setMemos([]);
    }
  };

  const saveMemo = async () => {
    try {
      const method = selectedMemo ? "PUT" : "POST";
      const body = {
        id: selectedMemo?.id,
        title: newTitle,
        content: newContent,
      };

      const response = await fetch("/api/memos", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        throw new Error(`Error saving memo: ${response.status}`);
      }

      fetchMemos();
      setIsEditing(false);
      setSelectedMemo(null);
      setNewTitle("");
      setNewContent("");
    } catch (err) {
      console.error("メモの保存に失敗しました:", err);
    }
  };

  const deleteMemo = async (id) => {
    if (!window.confirm("このメモを削除してもよろしいですか？")) return;

    try {
      const response = await fetch("/api/memos", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });

      if (!response.ok) {
        throw new Error(`Error deleting memo: ${response.status}`);
      }

      fetchMemos();
      setSelectedMemo(null);
    } catch (err) {
      console.error("メモの削除に失敗しました:", err);
    }
  };

  const filteredMemos = (memos || []).filter(
    (memo) =>
      memo.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      memo.content?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const updateSettings = async () => {
    try {
      const response = await fetch("/api/update-settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          password: newPassword || undefined,
          theme: theme,
        }),
      });

      if (!response.ok) {
        throw new Error(`Error updating settings: ${response.status}`);
      }

      setIsSettingsOpen(false);
      setNewPassword("");
      if (newPassword) {
        setPassword(newPassword);
      }
    } catch (err) {
      console.error("設定の更新に失敗しました:", err);
    }
  };

  const getThemeColors = () => {
    return theme === "light-pink"
      ? "from-[#fff0f5] via-[#ffe4e1] to-[#ffb6c1]"
      : "from-[#1a237e] via-[#0d47a1] to-[#000000]";
  };

  const getThemeTextColors = () => {
    return theme === "light-pink" ? "text-gray-800" : "text-white";
  };

  const getThemeBackgroundColors = () => {
    return theme === "light-pink" ? "bg-white/10" : "bg-white/5";
  };

  if (!isAuthenticated) {
    return (
      <div
        className={`min-h-screen bg-gradient-to-br ${getThemeColors()} flex items-center justify-center p-4`}
      >
        <div
          className={`${getThemeBackgroundColors()} backdrop-blur-md rounded-lg shadow-xl p-8 w-full max-w-md transition-transform duration-500 ${
            isAnimating ? "translate-y-full opacity-0" : ""
          }`}
        >
          <div className="space-y-4">
            <input
              type="password"
              value={password}
              onChange={handlePasswordChange}
              placeholder="Password"
              maxLength="4"
              className={`w-full px-4 py-2 text-center text-2xl tracking-widest border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 ${getThemeBackgroundColors()} ${getThemeTextColors()} placeholder-white/50`}
            />
            {error && (
              <p className="text-red-300 text-sm text-center animate-shake">
                {error}
              </p>
            )}
          </div>
        </div>
        <style jsx global>{`
          @keyframes shake {
            0%, 100% { transform: translateX(0); }
            25% { transform: translateX(-5px); }
            75% { transform: translateX(5px); }
          }
          .animate-shake {
            animation: shake 0.5s ease-in-out;
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-gradient-to-br ${getThemeColors()}`}>
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row gap-6">
          <div className="w-full md:w-1/3 lg:w-1/4">
            <div
              className={`${getThemeBackgroundColors()} backdrop-blur-md rounded-lg shadow-lg p-4`}
            >
              <div className="flex items-center gap-2 mb-4">
                <div className="relative flex-1">
                  <input
                    type="text"
                    placeholder="メモを検索..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className={`w-full pl-10 pr-3 py-2 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 ${getThemeBackgroundColors()} ${getThemeTextColors()} placeholder-white/50`}
                  />
                  <i className="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-white/50"></i>
                </div>
                <button
                  onClick={() => setIsSettingsOpen(!isSettingsOpen)}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                >
                  <i
                    className={`fas fa-cog text-xl ${getThemeTextColors()} opacity-70`}
                  ></i>
                </button>
              </div>

              <button
                onClick={() => {
                  setSelectedMemo(null);
                  setIsEditing(true);
                  setNewTitle("");
                  setNewContent("");
                }}
                className={`w-full px-4 py-2 mb-4 rounded-lg transition-colors bg-blue-600/80 hover:bg-blue-700/80 text-white flex items-center justify-center gap-2`}
              >
                <i className="fas fa-plus"></i>
                新規メモ作成
              </button>

              <div className="grid grid-cols-1 gap-3">
                {filteredMemos.map((memo) => (
                  <div
                    key={memo.id}
                    onClick={() => {
                      setSelectedMemo(memo);
                      setIsEditing(false);
                    }}
                    className={`p-4 rounded-lg cursor-pointer transition-all duration-300 transform hover:scale-102 ${
                      selectedMemo?.id === memo.id
                        ? "bg-white/20"
                        : `${getThemeBackgroundColors()} hover:bg-white/10`
                    }`}
                  >
                    <h3
                      className={`font-medium ${getThemeTextColors()} text-lg mb-2`}
                    >
                      {memo.title}
                    </h3>
                    <p
                      className={`${getThemeTextColors()} opacity-70 text-sm line-clamp-2`}
                    >
                      {memo.content.replace(/!\[.*?\]\(.*?\)/g, "[画像]")}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="flex-1">
            {isSettingsOpen ? (
              <div
                className={`${getThemeBackgroundColors()} backdrop-blur-md rounded-lg shadow-lg p-6`}
              >
                <h2
                  className={`text-2xl font-bold ${getThemeTextColors()} mb-6`}
                >
                  設定
                </h2>
                <div className="space-y-6">
                  <div>
                    <label className={`block ${getThemeTextColors()} mb-2`}>
                      パスワード変更
                    </label>
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      maxLength="4"
                      placeholder="新しいパスワード (4桁)"
                      className={`w-full px-4 py-2 ${getThemeBackgroundColors()} border border-white/20 rounded-lg ${getThemeTextColors()}`}
                    />
                  </div>
                  <div>
                    <label className={`block ${getThemeTextColors()} mb-2`}>
                      カラーテーマ
                    </label>
                    <div className="flex gap-4">
                      <button
                        onClick={() => setTheme("light-pink")}
                        className={`px-4 py-2 rounded-lg ${
                          theme === "light-pink"
                            ? "bg-[#fff0f5] text-gray-800"
                            : `${getThemeBackgroundColors()} ${getThemeTextColors()}`
                        }`}
                      >
                        淡いピンク
                      </button>
                      <button
                        onClick={() => setTheme("deep-blue")}
                        className={`px-4 py-2 rounded-lg ${
                          theme === "deep-blue"
                            ? "bg-[#1a237e] text-white"
                            : `${getThemeBackgroundColors()} ${getThemeTextColors()}`
                        }`}
                      >
                        深い青
                      </button>
                    </div>
                  </div>
                  <div className="flex justify-end space-x-3">
                    <button
                      onClick={() => {
                        setIsSettingsOpen(false);
                        setNewPassword("");
                      }}
                      className={`px-4 py-2 ${getThemeTextColors()} opacity-70 hover:opacity-100`}
                    >
                      キャンセル
                    </button>
                    <button
                      onClick={updateSettings}
                      className={`px-6 py-2 bg-white/20 hover:bg-white/30 ${getThemeTextColors()} rounded-lg`}
                    >
                      保存
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div
                className={`${getThemeBackgroundColors()} backdrop-blur-md rounded-lg shadow-lg p-6 transition-all duration-300 transform`}
              >
                {isEditing ? (
                  <div className="space-y-4">
                    <input
                      type="text"
                      value={newTitle}
                      onChange={(e) => setNewTitle(e.target.value)}
                      placeholder="タイトルを入力"
                      className={`w-full px-4 py-2 text-xl font-medium border-b border-white/20 bg-transparent ${getThemeTextColors()} placeholder-white/50 focus:outline-none focus:border-blue-400`}
                    />
                    <textarea
                      value={newContent}
                      onChange={(e) => setNewContent(e.target.value)}
                      placeholder="メモを入力"
                      className={`w-full h-[calc(100vh-500px)] px-4 py-2 bg-transparent ${getThemeTextColors()} placeholder-white/50 border-none focus:outline-none resize-none`}
                    />
                    <div className="flex items-center gap-4">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={async (e) => {
                          if (e.target.files?.[0]) {
                            const { url, error } = await upload({
                              file: e.target.files[0],
                            });
                            if (!error) {
                              setUploadedImage(url);
                              setNewContent(
                                (content) => content + `\n![画像](${url})`
                              );
                            }
                          }
                        }}
                        className="hidden"
                        id="image-upload"
                      />
                      <label
                        htmlFor="image-upload"
                        className={`cursor-pointer px-4 py-2 ${getThemeBackgroundColors()} hover:bg-white/20 ${getThemeTextColors()} rounded-lg flex items-center gap-2`}
                      >
                        <i className="fas fa-image"></i>
                        画像を追加
                      </label>
                      {uploading && (
                        <span className={`${getThemeTextColors()} opacity-70`}>
                          アップロード中...
                        </span>
                      )}
                    </div>
                    <div className="flex justify-end space-x-3">
                      <button
                        onClick={() => {
                          setIsEditing(false);
                          setNewTitle("");
                          setNewContent("");
                          setUploadedImage(null);
                        }}
                        className={`px-4 py-2 ${getThemeTextColors()} opacity-70 hover:opacity-100`}
                      >
                        キャンセル
                      </button>
                      <button
                        onClick={saveMemo}
                        className="px-6 py-2 bg-blue-600/80 hover:bg-blue-700/80 text-white rounded-lg backdrop-blur-sm"
                      >
                        保存
                      </button>
                    </div>
                  </div>
                ) : selectedMemo ? (
                  <div>
                    <div className="flex justify-between items-center mb-4">
                      <h2
                        className={`text-2xl font-bold ${getThemeTextColors()}`}
                      >
                        {selectedMemo.title}
                      </h2>
                      <div className="space-x-2">
                        <button
                          onClick={() => {
                            setIsEditing(true);
                            setNewTitle(selectedMemo.title);
                            setNewContent(selectedMemo.content);
                          }}
                          className="px-4 py-2 text-blue-300 hover:text-blue-100"
                        >
                          <i className="fas fa-edit mr-2"></i>編集
                        </button>
                        <button
                          onClick={() => deleteMemo(selectedMemo.id)}
                          className="px-4 py-2 text-red-300 hover:text-red-100"
                        >
                          <i className="fas fa-trash-alt mr-2"></i>削除
                        </button>
                      </div>
                    </div>
                    <div
                      className={`prose max-w-none ${getThemeTextColors()} opacity-90 whitespace-pre-wrap`}
                    >
                      {selectedMemo.content.split("\n").map((line, index) => {
                        if (line.startsWith("![")) {
                          const match = line.match(/!\[.*?\]\((.*?)\)/);
                          if (match) {
                            return (
                              <img
                                key={index}
                                src={match[1]}
                                alt="メモの画像"
                                className="max-w-full h-auto rounded-lg my-4"
                              />
                            );
                          }
                        }
                        return <p key={index}>{line}</p>;
                      })}
                    </div>
                  </div>
                ) : (
                  <div
                    className={`text-center ${getThemeTextColors()} opacity-50 py-12`}
                  >
                    メモを選択するか、新規作成してください
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
      <style jsx global>{`
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateX(20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        
        .animate-slide-in {
          animation: slideIn 0.3s ease-out forwards;
        }
      `}</style>
    </div>
  );
}

export default MainComponent;
