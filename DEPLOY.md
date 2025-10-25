# フロントエンド Azureデプロイ手順

## 前提条件
- Azureポータルで App Service リソース作成済み
  - リソース名: `app-002-gen10-step3-1-node-oshima57`
  - OS: Linux
  - ランタイム: Node.js 20.x

## 1. GitHub Secretsの設定

### 発行プロファイルの取得
1. Azureポータルで `app-002-gen10-step3-1-node-oshima57` を開く
2. 上部メニューの「発行プロファイルのダウンロード」をクリック
3. ダウンロードされたXMLファイルの内容をコピー

### GitHub Secretsへの追加
1. GitHubリポジトリ（step4_posapp または practicaldeploy-frontend）を開く
2. `Settings` > `Secrets and variables` > `Actions` へ移動
3. `New repository secret` をクリック
4. 以下を設定：
   - Name: `AZUREAPPSERVICE_PUBLISHPROFILE_FRONTEND`
   - Secret: コピーしたXMLの内容を貼り付け
5. `Add secret` をクリック

## 2. デプロイの実行

```bash
# 変更をコミット
git add .
git commit -m "フロントエンドのAzureデプロイ設定を追加"

# プッシュ（自動的にGitHub Actionsが起動）
git push origin main
```

## 3. Azureポータルでの設定

### スタートアップコマンドの設定
1. Azureポータルで `app-002-gen10-step3-1-node-oshima57` を開く
2. 左メニューから「構成」を選択
3. 「全般設定」タブを開く
4. 「スタートアップコマンド」に以下を入力：
   ```
   node server.js
   ```
5. 「保存」をクリック

### 環境変数の設定（オプション）
1. 「構成」 > 「アプリケーション設定」タブ
2. 「新しいアプリケーション設定」をクリック
3. 以下を追加：
   - 名前: `NEXT_PUBLIC_API_BASE`
   - 値: `https://app-002-gen10-step3-1-py-oshima57.azurewebsites.net`
4. 「保存」をクリック

### ポート設定の確認
1. 「構成」 > 「アプリケーション設定」
2. `WEBSITES_PORT` が設定されていない場合、追加：
   - 名前: `WEBSITES_PORT`
   - 値: `8080`
3. 「保存」をクリック

## 4. デプロイ確認

デプロイ完了後（5-10分）、以下のURLにアクセス：
```
https://app-002-gen10-step3-1-node-oshima57.azurewebsites.net/
```

担当者コード入力画面が表示されればデプロイ成功！

## トラブルシューティング

### ログの確認
- Azureポータル > `app-002-gen10-step3-1-node-oshima57` > 「ログストリーム」

### よくある問題

1. **Application Errorが出る**
   - スタートアップコマンドが正しく設定されているか確認
   - ログストリームでエラー内容を確認

2. **500エラーが出る**
   - 環境変数 `NEXT_PUBLIC_API_BASE` が正しく設定されているか確認
   - node_modulesがデプロイに含まれているか確認

3. **404エラーが出る**
   - ビルドが正常に完了しているか GitHub Actions のログを確認
   - .nextディレクトリがデプロイに含まれているか確認

