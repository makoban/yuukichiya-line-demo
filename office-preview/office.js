const moduleDetails = {
  reservations: ["予約・採寸管理", "本日の予約、採寸内容、商品の受け渡し状況を日付と店舗ごとに確認する想定です。"],
  customers: ["会員・顧客管理", "氏名・電話番号・学校から検索し、保護者、お子様、採寸、予約、購入の情報をひとつの画面で確認する想定です。"],
  points: ["ポイント管理", "会員ごとのポイント残高、付与・使用・調整の履歴、操作した担当者と端末を確認する想定です。"],
  sales: ["売上管理", "日別・月別・店舗別の売上や商品区分を集計し、前月や前年と比較する想定です。"],
  logs: ["店舗端末ログ", "QR読取、会員照会、ポイント変更などの操作を、日時・店舗・端末名・担当者と一緒に確認する想定です。"],
  settings: ["事務所設定", "店舗、端末、担当者の権限、配信費用の計算条件などを管理する想定です。"],
  attention: ["確認が必要な業務", "本日は、予約の変更2件と店舗端末の同期確認1件がある想定です。"],
  store: ["利用店舗", "現在は「本店」を表示しています。本番版では権限のある店舗だけを切り替えられる想定です。"],
  account: ["ログイン中の担当者", "管理者権限のサンプル表示です。本番版では担当者ごとに操作可能な機能を制限します。"],
  notice: ["お知らせ", "メンテナンスや業務連絡を事務所と店舗の担当者へ共有する想定です。"],
};

const dialog = document.getElementById("moduleDialog");
const title = document.getElementById("moduleTitle");
const description = document.getElementById("moduleDescription");

document.querySelectorAll("[data-module]").forEach((control) => {
  control.addEventListener("click", () => {
    const detail = moduleDetails[control.dataset.module];
    if (!detail) return;
    [title.textContent, description.textContent] = detail;
    dialog.showModal();
  });
});

dialog.addEventListener("click", (event) => {
  if (event.target === dialog) dialog.close();
});
