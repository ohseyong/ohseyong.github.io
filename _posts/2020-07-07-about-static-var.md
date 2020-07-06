---
title: "[42 Seoul] C언어의 static 함수에 대하여"
# excerpt: "정말 10분이면 만들 수 있다"
date: 2020-07-07 00:00:00 +0900
categories: study
tags: GNL 42 C static variable
header:
  teaser: # /assets/blog2.png
  image: # /assets/mozilla_logo.png 

toc: true  
toc_sticky: true 
---

42cursus의 Get Next Line 과제를 수행하는 데 있어 반드시 필요한 개념인 정적 변수(static variable)에 대해 공부하며 정리하게 되었다. 이 개념을 알지 못한다면 절대로 Get Next Line 과제를 해결할 수 없다. 만약 GNL 과제를 통과했음에도 이 개념을 모르는 사람이 있다면 치팅을 의심해봐야 함이 옳다.

> *이 글을 42 Seoul의 hycho에게 바칩니다.*

### Static 변수 (정적 변수)
  * static 변수를 한 줄로 요약하자면, 지역변수와 전역변수 둘의 성질을 같이 가지고 있다고 생각하면 된다.
      * static 변수는 지역변수와 같이 **선언된 함수 내에서만** 사용이 가능하다. 
      * 그러나 한 번만 초기화하며, **전역 변수처럼 프로그램이 종료될 때까지 메모리 공간에 존재**한다. 
      * 지역 변수와는 달리, 해당 함수가 종료되거나 반환을 하더라도 소멸되지 않는다.
  * 변수를 선언할 때 static 키워드를 붙여 선언한다. `static int num`
  * **메모리의 데이터 영역에 저장**되어 프로그램이 종료될 때까지 남아있는 변수다.
  * 함수를 벗어나도 해당 변수는 사라지지 않고 계속 유지된다. 하지만 함수 내부에서 선언되었다면, 다른 함수에서는 이 값을 참조할 수 없다. 또한 함수의 시작이 아닌 프로그램의 시작 시 할당이 되며, 프로그램이 종료될 때 해제된다.
  * 일반 지역 변수가 할당되는 stack 부분이 아니라 data 부분에 할당된다.
  * 함수 내에서 `static int num = 0` 식으로 초기화하면 프로그램이 시작될 때 변수를 초기화하며, 함수가 호출될 때는 변수를 초기화하지 않는다. (여러 번 함수를 실행하더라도 그 변수가 또 초기화되지 않는다)
  * 정적 변수는 초깃값을 지정하지 않으면 0으로 알아서 초기화된다. (지역 변수는 초기화하지 않으면 쓰레기값으로 초기화된다.)
  * 무슨 말인지는 잘 모르겠는데, C언어에서는 정적 변수를 리터럴 상수로만 초기화가 가능하다고 한다.
  * 정적 변수를 전역 변수로 사용한다면
    ![img](/assets/images/unit79-1.png)
    이미지 출처 : https://dojang.io/mod/page/view.php?id=690
  * [위키피디아의 정적 변수 설명](https://ko.wikipedia.org/wiki/%EC%A0%95%EC%A0%81_%EB%B3%80%EC%88%98)

 

### Static 변수 예제

#### static 변수를 사용하지 않은 경우

```c
#include <stdio.h>
 
int non_static(void)
{
    int cnt = 0;
    cnt++;
 
    return cnt;
}
 
int main(void)
{
    printf("%d\n", non_static());
    printf("%d\n", non_static());
 
    return 0;
}
```

위와 같이, 일반적인 경우 (지역 변수를 사용했다면) 아래와 같이 프로그램이 실행된다.

```
1
1
```

`non_static()` 함수 안에 cnt라는 지역 변수가 선언되었으며, 이는 `main()` 함수에서 `non_static()` 함수를 호출할 때 비로소 메모리에 할당되며 초기화된다.  이후 `cnt++` 문을 통해 `cnt` 변수의 값은 1이 되며, 그 1을 출력하게 된다.

#### static 변수를 사용하는 경우

```C
#include <stdio.h>
 
int static_test(void)
{
    static int cnt = 0;
    cnt++;
 
    return cnt;
}
 
int main(void)
{
    printf("%d\n", static_test());
    printf("%d\n", static_test());
 
    return 0;
}
```



`static` 이라는 문구가 `static_test` 함수 내에 선언된 변수 앞에 추가되었다. 이는 정적 변수로 선언되었음을 의미하며, 이는 상술한 바와 같이 컴파일 시 아예 메모리에 할당된다. `cnt` 변수는 프로그램이 종료되기 전까지 메모리의 자리를 차지한다. 이렇게 정적 변수를 사용했다면 실행 결과는 아래와 같다.

```
1
2
```