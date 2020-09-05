---
title: "[42 Seoul] printf 과제를 수행하며 삽질한 기록들"
excerpt: # "컴파일 옵션 : 외부 라이브러리를 이용한 컴파일 등의 내용들"
date: 2020-08-10 02:00:00 +0900
categories: study
tags: vim 42 vimrc ft_printf C
header:
  teaser: # /assets/blog2.png
  image: # /assets/mozilla_logo.png 

toc: true  
toc_sticky: true 

---

ft_printf 과제를 하면서 코드를 짜는 과정을 정말 세세하게 하나하나 정리하고자 한다. 코드 짜는 것 자체가 너무 오랜만이라, 세분화해서 단계별로 아주 디테일하게 작성해보려고 한다. 이 과제를 수행하며 어떻게 해야할 지 감이 안 오는 사람들에게도 많은 도움이 되었으면 좋겠다.



#### ft_printf 과제가 요구하는 것들

- 간단하다. printf 함수를 똑같이 구현하면 된다.
- 함수의 프로토타입은 `int ft_printf(const char *, ...);` 이다.
- 다만 함수의 모든 부분을 구현하기에는 다소 빡센 부분들이 있으므로(인간적으로 솔직히 이것보다 더 요구하는건 오바다), 100% 똑같지는 않다. 단, 보너스 과제를 수행하려면 %f 형식 지정자라던지 몇 가지를 더 해야 하는데 여기서는 생략한다.
- 예를 들자면, 아래의 형식 지정자에 대해서만 구현하면 된다.

  - c : 문자, character
  - s : 문자열, string
  - p : 메모리 주소값, 아마도 pointer?
  - d : 10진수 4바이트 정수
  - i : 10진수 4바이트 정수, d랑 완전히 같다. 아마도 integer인듯
  - u : 부호가 없는 10진수 정수, 아마도 unsigned인듯
  - x : 부호가 없는 16진수 정수, 알파벳은 소문자로 표현
- 그리고 아래의 플래그만 구현하면 된다.

  - \-  : 왼쪽 정렬
- 0 : 출력하는 폭의 남는 공간을 0으로 채움
  - .  : 정밀도 - 지정한 숫자만큼 소수점 아래 자리 출력
  - \* : 출력할 너비를 인자로 받는다.
    예를 들어 `ft_printf("%*d", 5)` 를 입력하게 되면 `%5d` 가 되는 식이다.
- 보너스 과제 수행을 원한다면, 형식 지정자 `n` `f` `g` `e` 에 대해서 구현하고, 플래그  `l` `ll` `h` `hh` 



#### 단계별 과제 수행 

일단 나는 이런 순서대로 수행하고 있다. 

1. `ft_printf("string%d");` 를 수행한다고 가정하고, 입력받은 스트링의 문자를 하나하나 %인지 체크한다. %가 아니라면 `write()` 해 출력한다.
2. 만약 %를 만났다면 % 뒤의 문자를 불러와 형식 지정자 유형에 맞는 문자를 찾는다. 이 때, 어쨌든 뒤에 형식 지정자(c, s, p, d, i, u, x)가 나올 때까지 뒤 문자를 하나하나 불러와 찾는다. 예를 들어 %aaad인 경우 d가 나올 때까지 a는 무시하고 넘어가며 찾으면 된다. 함수를 사용하는 방법이 잘못된 거니까 그냥 d가 나올 때까지 찾고 a는 `write()`  하지 않고 넘어가면 된다. 우선 큰 그림만 그리기 위해 c, s, d의 기본 출력 기능만 구현했다.
3. printf 원함수에도 있는 기능인데, printf 함수에는 리턴값이 있다. 이 리턴값 출력을 위해 비어있는 `rtn` 변수를 만들고, 한 개의 문자 출력 시 `rtn++` 을 해 주는 기능을 구현한다. 



아래는 작성 중인 중간 단계의 코드다.



아래에는 설명을 위해 작성하던 중간 단계의 소스코드를 남겨놓는다. (추후 설명 추가 예정)

```c
#include "ft_printf.h"

void	spec(const char **a, va_list ap)
{
	int tmp; //출력할 문자를 잠시 복사해 둘 비어있는 변수, char도 결국엔 int이므로 int형으로 선언해도 된다.
	char *tmp2; //복사할 문자열을 위한 빈 포인터 변수
	
	if ( !(tmp2 = (char*)malloc(sizeof(char) + 1)))
		return ;
	while (**a)
	{
		if ((char) **a == 'c')
		{
			tmp = va_arg(ap, int);
			write(1, &tmp, 1);
			(*a)++;
			break ;
		}
		if ((char) **a == 'd')
		{
			tmp2 = ft_itoa(va_arg(ap, int)); 
			while (*tmp2)
			{
				write(1, &*tmp2, 1);
				tmp2++;
			}
			(*a)++;
			break ;
		}
		if ((char) **a == 's')
		{
			tmp2 = va_arg(ap, char*);
			while (*tmp2)
			{
				write(1, &*tmp2, 1);
				tmp2++;
			}
			(*a)++;
			break ;
		}
		(*a)++;
	}
}

int		ft_printf(const char *input, ...)
{
	va_list ap;

	va_start(ap, input);
	while (*input)
	{
		if (*input == '%')
		{
			spec(&input, ap);
			continue ;
		}
		else
			write(1, &*input, 1);
		input++;
	}
	return (0);
}
```

