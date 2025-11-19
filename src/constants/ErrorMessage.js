export const ERROR_MESSAGE = {
    LOGIN_FAIL_HEAD: "🌚 Good Night!",
    LOGIN_FAIL_DESCRIPTION: "로그인에 실패했습니다.",
    INVALID_LOGIN_INPUT: "올바른 레퍼지토리 URL과 토큰을 입력해주세요.",
    
    FAIL_LOAD_FILES: "파일 목록을 불러오는데 실패했습니다. 다시 로그인해주세요.",
    FAIL_LOAD_FILE: "파일을 불러오는데 실패했습니다.",
    FAIL_SAVE_FILE: "파일 저장에 실패했습니다. 페이지를 새로고침합니다.",

    DELETE_TEXT_FAIL: "작성한 글은 지울 수 없어요.",
    TITLE_LIMIT_EXCEEDED: (maxLength) => `제목은 최대 ${maxLength}자까지 작성할 수 있어요.`,
    CONTENT_LIMIT_EXCEEDED: (maxLength) => `본문은 최대 ${maxLength.toLocaleString()}자까지 작성할 수 있어요.`,
    TITLE_PREFIX_IMMUTABLE: "기본 날짜 제목은 삭제할 수 없습니다.",

    ALREADT_ADDED_FILE_TO_FAVORITES: "이미 즐겨찾기에 추가된 파일입니다.",
    NON_EXISTENT_FILE: "존재하지 않는 파일이 있습니다. \n 제외하고 저장을 진행합니다.",
    
};
