---
title: "Swift 기초 : Optional"
# excerpt: "최초의 IBM PC, 수많은 역사적 8비트 컴퓨터들부터 Apple II, Macintosh를 비롯한 애플의 살아있는 역사, Thinkpad 시리즈와 예전에 사용했던 소형 전자기기들을 직접 마음대로 만져보고 경험할 수 있는 제로하나 컴퓨터박물관을 방문한 후기입니다."
date: 2022-04-29 06:00:00 +0900
categories: Study
tags: apple swift
header:
  teaser: # /assets/backquote.jpg
  image: # /assets/mozilla_logo.png 
toc: true  
toc_sticky: true 

---

### Optional

- 값이 있을 수도, 없을 수도 있음
- 옵셔널이 아닌 상수에다가 nil 값을 할당하려고 하면 오류가 남
  - nil? 다른 언어의 NULL과 유사한 표현

- nil의 가능성을 문서화하지 않고도 명시적으로 표현할 수 있음
  - 문서에서 '이 값은 nil이 아니어야만 한다' 라는 표현을 볼 수 있는데, 이것을 '옵셔널이다' 라고 말함으로써 해결 가능


```swift
let optionalValue: Optional<Int> = nil
let optionalValue: Int? = nil
// 두 개는 같은 의미. 윗줄이 정식 문법이나 아랫줄도 유효함
```



#### 암시적 추출 옵셔널

```swift
var optionalValue: Int! = 100
switch optionalValue {
case .none:
    print("This Optional variable is nil")
case .some(let value):
    print("Value is \(value)")
}
```



