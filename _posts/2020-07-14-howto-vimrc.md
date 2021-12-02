---
title: "[42 Seoul] 알아두면 편리한, 최소한의 VIM 설정법(.vimrc)"
# excerpt: "정말 10분이면 만들 수 있다"
date: 2020-07-14 00:00:00 +0900
categories: study
tags: howto vim 42 vimrc
header:
  teaser: # /assets/blog2.png
  image: # /assets/mozilla_logo.png 

toc: true  
toc_sticky: true 
---



42에서는 vim 편집기를 사용할 일이 잦은 편이다. 이에 몇 가지 중요한 vim 편집기의 설정을 공유한다. 아래 내용을 `~/.vimrc` 파일에 넣어두면 vim을 조금 더 편리하게 사용할 수 있다. 사실 설정은 얼마든지 더 많이 넣어둘 수 있지만, 이정도면 충분히 편하게 사용할 수 있기도 하고, vimrc 설정이 필요한 상황에서 바로바로 기억할 수 있는 것들 위주로 적어두었다.



```c
if has("syntax")  " syntax가 있는 파일이라면
    syntax on     " syntax highlighting 기능을 켠다
endif
set nu            " 왼쪽에 줄 번호 표시
set mouse=a       " 마우스 사용 옵션 (a는 auto)
set autoindent    " 자동 들여쓰기
set cursorline    " 커서가 있는 라인을 밑줄로 강조
set ignorecase    " 검색 기능 사용 시 대소문자 무시
set ruler         " 오른쪽 하단에 현재 커서의 위치 표시
set title         " 현재 열린 파일 이름을 창 타이틀에 표시
set hlsearch      " 모든 검색결과 하이라이트
set ignorecase    " 대소문자 무시하고 검색
set incsearch     " 타이핑할 때마다 검색 결과 표시
set noswapfile    " 스왑파일 사용안함
  
 call plug#begin('~/.vim/plugged')
     "Plug 'Github계정명/저장소명'"
     Plug 'pbondoer/vim-42header'
     Plug 'scrooloose/nerdtree'
 call plug#end()

 nmap <F6> :NERDTreeToggle<CR>

 let g:hdr42user = 'seoh'
 let g:hdr42mail = 'seoh@student.42seoul.kr'
```

참고로 set title의 아래 내용들은 개인적으로 사용하는 플러그인과 관련한 내용으로,  set title을 포함해 그 위 내용만 넣어두면 된다.



<del>사실 이 글은 내가 .vimrc 파일을 백업하기 위해 작성했다.</del>