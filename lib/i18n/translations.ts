// TODO: 중국어(zh), 스페인어(es) 등 추가 언어 지원
export type Locale = "ko" | "en" | "ja"

export const translations = {
  ko: {
    meta: {
      title: "Instafit - 인스타그램 이미지 리사이저",
      description: "이미지를 인스타그램에 딱 맞게, 배경까지 예쁘게",
    },
    header: {
      title: "Instafit",
      subtitle: "이미지를 인스타그램에 딱 맞게, 배경까지 예쁘게",
    },
    step: {
      upload: "업로드",
      edit: "편집",
      download: "저장",
    },
    upload: {
      title: "이미지 업로드",
      dragDrop: "클릭하거나 이미지를 여기로 드래그하세요",
      multiple: "여러 장을 한 번에 선택할 수 있어요",
      uploaded: "업로드된 이미지",
      count: "장",
    },
    template: {
      title: "템플릿 선택",
      square: "피드 정사각형",
      portrait: "스토리 / 릴스",
      landscape: "피드 가로형",
    },
    background: {
      title: "배경 스타일",
      solid: "단색",
      blur: "블러",
      gradient: "그라데이션",
      solidColor: "배경색",
      blurIntensity: "블러 강도",
      startColor: "시작 색상",
      endColor: "끝 색상",
      direction: "방향",
      presets: "프리셋",
      customColor: "직접 선택",
      subtle: "약하게",
      strong: "강하게",
      blurDescription: "원본 이미지를 확대하고 블러 처리하여 자연스러운 배경을 만듭니다",
    },
    preview: {
      title: "미리보기",
      empty: "아직 이미지가 없어요",
      emptyDescription: "이미지를 업로드하면 여기에 미리보기가 표시됩니다",
    },
    action: {
      download: "이미지 저장하기",
      downloadAll: "모두 저장하기",
      downloading: "저장 중...",
      select: "선택",
      delete: "삭제",
      undo: "실행 취소",
      redo: "다시 실행",
    },
    mosaic: {
      title: "모자이크 브러시",
      enable: "모자이크 켜기",
      disable: "모자이크 끄기",
      reset: "초기화",
      brushSize: "브러시 크기",
      blockSize: "블록 크기",
      small: "작게",
      large: "크게",
      fine: "세밀",
      coarse: "거칠게",
    },
    toast: {
      uploadSuccess: "{count}개의 이미지가 업로드되었습니다",
      downloadSuccess: "이미지가 저장되었습니다",
      downloadError: "이미지 저장에 실패했습니다",
      batchProgress: "{current}/{total} 처리 중...",
      batchSuccess: "{count}개의 이미지가 저장되었습니다",
      batchError: "{success}개 저장 완료, {failed}개 실패",
      mosaicReset: "모자이크가 초기화되었습니다",
    },
  },
  en: {
    meta: {
      title: "Instafit - Instagram Image Resizer",
      description: "Resize your images perfectly for Instagram with beautiful backgrounds",
    },
    header: {
      title: "Instafit",
      subtitle: "Resize your images perfectly for Instagram with beautiful backgrounds",
    },
    step: {
      upload: "Upload",
      edit: "Edit",
      download: "Save",
    },
    upload: {
      title: "Upload Images",
      dragDrop: "Click or drag images here",
      multiple: "You can select multiple images at once",
      uploaded: "Uploaded images",
      count: "",
    },
    template: {
      title: "Select Template",
      square: "Feed Square",
      portrait: "Story / Reels",
      landscape: "Feed Landscape",
    },
    background: {
      title: "Background Style",
      solid: "Solid",
      blur: "Blur",
      gradient: "Gradient",
      solidColor: "Background Color",
      blurIntensity: "Blur Intensity",
      startColor: "Start Color",
      endColor: "End Color",
      direction: "Direction",
      presets: "Presets",
      customColor: "Custom",
      subtle: "Subtle",
      strong: "Strong",
      blurDescription: "Creates a natural background by zooming and blurring the original image",
    },
    preview: {
      title: "Preview",
      empty: "No images yet",
      emptyDescription: "Upload an image to see the preview here",
    },
    action: {
      download: "Download Image",
      downloadAll: "Download All",
      downloading: "Downloading...",
      select: "Select",
      delete: "Delete",
      undo: "Undo",
      redo: "Redo",
    },
    mosaic: {
      title: "Mosaic Brush",
      enable: "Enable Mosaic",
      disable: "Disable Mosaic",
      reset: "Reset",
      brushSize: "Brush Size",
      blockSize: "Block Size",
      small: "Small",
      large: "Large",
      fine: "Fine",
      coarse: "Coarse",
    },
    toast: {
      uploadSuccess: "{count} image(s) uploaded",
      downloadSuccess: "Image saved successfully",
      downloadError: "Failed to save image",
      batchProgress: "Processing {current}/{total}...",
      batchSuccess: "{count} image(s) saved",
      batchError: "{success} saved, {failed} failed",
      mosaicReset: "Mosaic has been reset",
    },
  },
  ja: {
    meta: {
      title: "Instafit - Instagram画像リサイザー",
      description: "画像をInstagramにぴったりサイズに、背景も美しく",
    },
    header: {
      title: "Instafit",
      subtitle: "画像をInstagramにぴったりサイズに、背景も美しく",
    },
    step: {
      upload: "アップロード",
      edit: "編集",
      download: "保存",
    },
    upload: {
      title: "画像をアップロード",
      dragDrop: "クリックまたは画像をここにドラッグ",
      multiple: "複数の画像を一度に選択できます",
      uploaded: "アップロード済み",
      count: "枚",
    },
    template: {
      title: "テンプレートを選択",
      square: "フィード正方形",
      portrait: "ストーリー / リール",
      landscape: "フィード横長",
    },
    background: {
      title: "背景スタイル",
      solid: "単色",
      blur: "ぼかし",
      gradient: "グラデーション",
      solidColor: "背景色",
      blurIntensity: "ぼかし強度",
      startColor: "開始色",
      endColor: "終了色",
      direction: "方向",
      presets: "プリセット",
      customColor: "カスタム",
      subtle: "弱め",
      strong: "強め",
      blurDescription: "元の画像を拡大してぼかすことで自然な背景を作成します",
    },
    preview: {
      title: "プレビュー",
      empty: "まだ画像がありません",
      emptyDescription: "画像をアップロードするとここにプレビューが表示されます",
    },
    action: {
      download: "画像を保存",
      downloadAll: "すべて保存",
      downloading: "保存中...",
      select: "選択",
      delete: "削除",
      undo: "元に戻す",
      redo: "やり直す",
    },
    mosaic: {
      title: "モザイクブラシ",
      enable: "モザイクを有効化",
      disable: "モザイクを無効化",
      reset: "リセット",
      brushSize: "ブラシサイズ",
      blockSize: "ブロックサイズ",
      small: "小さく",
      large: "大きく",
      fine: "細かく",
      coarse: "粗く",
    },
    toast: {
      uploadSuccess: "{count}枚の画像がアップロードされました",
      downloadSuccess: "画像を保存しました",
      downloadError: "画像の保存に失敗しました",
      batchProgress: "{current}/{total} 処理中...",
      batchSuccess: "{count}枚の画像を保存しました",
      batchError: "{success}枚保存完了、{failed}枚失敗",
      mosaicReset: "モザイクがリセットされました",
    },
  },
} as const

export interface Translations {
  meta: { title: string; description: string }
  header: { title: string; subtitle: string }
  step: { upload: string; edit: string; download: string }
  upload: { title: string; dragDrop: string; multiple: string; uploaded: string; count: string }
  template: { title: string; square: string; portrait: string; landscape: string }
  background: {
    title: string
    solid: string
    blur: string
    gradient: string
    solidColor: string
    blurIntensity: string
    startColor: string
    endColor: string
    direction: string
    presets: string
    customColor: string
    subtle: string
    strong: string
    blurDescription: string
  }
  preview: { title: string; empty: string; emptyDescription: string }
  mosaic: {
    title: string
    enable: string
    disable: string
    reset: string
    brushSize: string
    blockSize: string
    small: string
    large: string
    fine: string
    coarse: string
  }
  action: { download: string; downloadAll: string; downloading: string; select: string; delete: string; undo: string; redo: string }
  toast: { uploadSuccess: string; downloadSuccess: string; downloadError: string; batchProgress: string; batchSuccess: string; batchError: string; mosaicReset: string }
}
