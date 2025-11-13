Sub CalculateAssessment()
    '
    ' IT Governance Assessment 集計マクロ
    '
    Dim wsInput As Worksheet
    Dim wsAnalysis As Worksheet
    Dim wsDB As Worksheet
    Dim lastRow As Long
    Dim i As Integer
    Dim allAnswered As Boolean
    Dim companyName As String
    Dim personName As String

    ' シート参照
    Set wsInput = ThisWorkbook.Sheets("Input_Form")
    Set wsAnalysis = ThisWorkbook.Sheets("Analysis_Internal")
    Set wsDB = ThisWorkbook.Sheets("DB_AllResponses")

    ' 入力チェック
    allAnswered = True
    For i = 10 To 34  ' 質問行（25問）
        If wsInput.Range("C" & i).Value = "" Then
            allAnswered = False
            Exit For
        End If
    Next i

    If Not allAnswered Then
        MsgBox "全ての質問に回答してください。", vbExclamation, "入力エラー"
        Exit Sub
    End If

    ' 会社名・担当者名チェック
    companyName = wsInput.Range("B4").Value
    personName = wsInput.Range("B5").Value

    If companyName = "" Or personName = "" Then
        MsgBox "会社名と担当者名を入力してください。", vbExclamation, "入力エラー"
        Exit Sub
    End If

    ' 強制再計算
    Application.Calculate

    ' 結果をDBシートに追記（オプション）
    lastRow = wsDB.Cells(wsDB.Rows.Count, 1).End(xlUp).Row + 1

    wsDB.Cells(lastRow, 1).Value = Date  ' 日付
    wsDB.Cells(lastRow, 2).Value = companyName  ' 会社名
    wsDB.Cells(lastRow, 3).Value = personName  ' 担当者名
    wsDB.Cells(lastRow, 4).Value = wsAnalysis.Range("B2").Value  ' 総合スコア
    wsDB.Cells(lastRow, 5).Value = wsAnalysis.Range("B3").Value  ' 戦略
    wsDB.Cells(lastRow, 6).Value = wsAnalysis.Range("B4").Value  ' 組織
    wsDB.Cells(lastRow, 7).Value = wsAnalysis.Range("B5").Value  ' プロセス
    wsDB.Cells(lastRow, 8).Value = wsAnalysis.Range("B6").Value  ' リスク
    wsDB.Cells(lastRow, 9).Value = wsAnalysis.Range("B7").Value  ' パフォーマンス

    ' 完了メッセージ
    MsgBox "集計が完了しました！" & vbCrLf & vbCrLf & _
           "総合スコア: " & Format(wsAnalysis.Range("B2").Value, "0.00") & vbCrLf & _
           "結果は右側の【簡易診断結果】エリアに表示されています。", _
           vbInformation, "集計完了"

End Sub

Sub ProtectAnalysisSheet()
    '
    ' Analysis_Internal シートを保護（VeryHidden設定）
    '
    Dim ws As Worksheet
    Set ws = ThisWorkbook.Sheets("Analysis_Internal")

    ' シートを非常に非表示に設定
    ws.Visible = xlSheetVeryHidden

    MsgBox "Analysis_Internal シートを非表示にしました。", vbInformation
End Sub

Sub UnprotectAnalysisSheet()
    '
    ' Analysis_Internal シートの保護を解除
    ' ※パスワード: "abeam2025"
    '
    Dim password As String
    Dim inputPwd As String
    Dim ws As Worksheet

    password = "abeam2025"
    inputPwd = InputBox("パスワードを入力してください:", "シート表示")

    If inputPwd = password Then
        Set ws = ThisWorkbook.Sheets("Analysis_Internal")
        ws.Visible = xlSheetVisible
        MsgBox "Analysis_Internal シートを表示しました。", vbInformation
    Else
        MsgBox "パスワードが正しくありません。", vbCritical
    End If
End Sub
