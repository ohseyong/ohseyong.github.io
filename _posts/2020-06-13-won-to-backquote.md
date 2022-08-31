---
title: "맥에서 `키를 누를 때 ₩가 입력되는 것이 짜증난다면"
# excerpt: "정말 10분이면 만들 수 있다"
date: 2020-06-13 17:00:00 +0900
categories: macOS
tags: howto keyboard setting markdown
header:
  teaser: /assets/backquote.jpg
  image: # /assets/mozilla_logo.png 

toc: true  
toc_sticky: true 
---

macOS Sierra 이후 버전에서는 macOS의 키보드 입력 모드가 한글인 상태에서는 Backquote( ` ) 키를 누르면 원화 기호( ₩ )가 입력된다. (심지어 최근 신제품에는 키보드에도 백쿼트가 아닌 원화 특수문자가 그려져 있다.) 개발자 등 마크다운 문서를 작성할 일이 많은 사람들에겐 매우 불편한 설정이다.

### 해결하는 방법
`~/Library` 디렉토리로 이동한 후, KeyBindings 디렉토리로 이동한다. 혹시 없다면 디렉토리를 만든다.

~~~shell
$ cd ~/Library
$ mkdir KeyBindings (이미 디렉토리가 있다면 생략한다)
~~~

`~/Library/KeyBindings` 디렉토리에 `DefaultkeyBinding.dict` 파일을 생성한다.

~~~shell
$ touch DefaultkeyBinding.dict (이미 파일이 있다면 생략한다)
~~~

`DefaultkeyBinding.dict` 파일에 아래 내용을 추가한다.

~~~shell
{
    "₩" = ("insertText:", "`");
}
~~~

그리고 나서 컴퓨터를 껐다 켜거나, 아니면 `를 입력하고 싶은 애플리케이션을 껐다 켜면 원화 키를 눌러도 백쿼트가 정상적으로 입력되는 것을 확인할 수 있다.

### 더 쉬운 방법
[어떤 멋진 분께서 이걸 쉽게 할 수 있는 쉘 스크립트를 만들어 두신 것을 발견했다.](https://gist.github.com/redism/43bc51cab62269fa97a220a7bb5e1103) 위 과정을 직접 수행할 필요 없이, 터미널을 열고 아래 명령어 한 줄만 입력하면 바로 설정이 적용된다.

~~~shell
curl -sSL https://gist.githubusercontent.com/redism/43bc51cab62269fa97a220a7bb5e1103/raw/0d55b37b60e0e0bd3d0d7f53995de0a722f9820c/kr_won_to_backquote.sh | sh
~~~

### 바꾸고 난 후의 문제점
이렇게 하고 나서 원화 부호를 입력하고 싶을 때는 어떻게 해야하는지 모르겠다는 문제가 있긴 한데, 원화 부호 입력할 일은 아무래도 별로 없어서 괜찮은 것 같다.