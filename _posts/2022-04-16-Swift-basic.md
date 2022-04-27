---
title: "Swift 기초 : 문자열 보간법, print 함수, 컬렉션 타입"
# excerpt: "최초의 IBM PC, 수많은 역사적 8비트 컴퓨터들부터 Apple II, Macintosh를 비롯한 애플의 살아있는 역사, Thinkpad 시리즈와 예전에 사용했던 소형 전자기기들을 직접 마음대로 만져보고 경험할 수 있는 제로하나 컴퓨터박물관을 방문한 후기입니다."
date: 2022-04-16 06:00:00 +0900
categories: Study
tags: apple swift
header:
  teaser: # /assets/backquote.jpg
  image: # /assets/mozilla_logo.png 
toc: true  
toc_sticky: true 

---

#### 문자열 보간법

- print 함수를 통해 보다 더 내가 원하는 방향대로 문자열을 출력하는 방법 
- 문자열 내에 `\값` 의 형태로 표기하면 값을 문자열로 치환해서 넣어줌

문자열 보간법을 사용하지 않는다면 :

```swift
for count in 1...3 {
    print(count, " 번째 카운트")
}
```

문자열 보간법을 사용한다면 :

```swift
for count in 1...3 {
    print("\(count) 번째 카운트")
}
```

이렇게 표현하면, `count`값이 문자열로 치환되어서 한 개의 문자열로 취급된다. 위 두 개의 코드는 실행 결과가 동일하다.

#### `print` 함수의 특이점

- `print`함수는 인자를 여러 개 받을 수 있고, 인자값은 기본적으로 띄어쓰기로 구분(seperate)함. '기본적'이라는 말은, 바꿀 수도 있다는 의미임. seperator 인자를 통해 바꿀 수 있음.

```swift
print(1, 2, 3, separator: "!")
```

위와 같은 코드를 실행하면 `1!2!3`이 출력된다. 

만약 아무 구분을 두고 싶지 않다면, 아래와 같이 작성하면 된다.

```
print(1, 2, 3, separator: "")
```

실행 결과는 `123` 이다.



- `print` 함수는 기본적으로 문자열 출력 후 개행을 한다. 그런데 이러한 개행이 싫다면?

```swift
print("내가 좋아하는 계절 : ")
print("봄")
```

실행 결과 :

```swift
내가 좋아하는 계절 : 
봄
```

이러한 문자열을 한 줄에 표현하고 싶다면

```swift
print("내가 좋아하는 계절", terminator: " : ")
print("봄")
```

이렇게 하면

```swift
내가 좋아하는 계절 : 봄
```

으로 실행되는 것을 확인할 수 있다.

* 여러 매개변수 동시에 사용하기

`print` 함수에서 `seperator`과 `terminator` 매개 변수는 동시에 사용할 수도 있고, 하나만 골라서 사용할 수도 있고, 아예 사용하지 않을 수도 있음. 단 동시에 사용할 때는 seperator가 먼저 위치해야 함.

```swift
print("내가 좋아하는 계절", terminator: " : ")
print(봄, 여름, 가을, separator: ", ", terminator: " 그리고 겨울!")
```



### 컬렉션 타입

#### Array

* 순서가 있는 리스트 컬렉션

##### Array 생성

```swift
// 빈 Int Array 생성
var integers: Array<Int> = Array<Int>()

// 같은 표현
// var integers: Array<Int> = [Int]()
// var integers: Array<Int> = []
// var integers: [Int] = Array<Int>()
// var integers: [Int] = [Int]()
// var integers: [Int] = []
// var integers = [Int]()
```



##### Array 활용

```swift
integers.append(1)
integers.append(100)

// Int 타입이 아니므로 Array에 추가할 수 없습니다
//integers.append(101.1)

print(integers)    // [1, 100]

// 멤버 포함 여부 확인
print(integers.contains(100)) // true
print(integers.contains(99)) // false

// 멤버 교체
integers[0] = 99

// 멤버 삭제
integers.remove(at: 0)
integers.removeLast()
integers.removeAll()

// 멤버 수 확인
print(integers.count)

// 인덱스를 벗어나 접근하려면 익셉션 런타임 오류발생
//integers[0]

// let을 사용하여 Array를 선언하면 불변 Array가 됩니다
let immutableArray = [1, 2, 3]

// 수정이 불가능한 Array이므로 멤버를 추가하거나 삭제할 수 없습니다
//immutableArray.append(4)
//immutableArray.removeAll()
```



#### Dictionary

* `키`와 `값`의 쌍으로 이루어진 컬렉션
* 여러 리터럴 문법을 활용할 수 있어서 표현 방법이 다양함

##### Dictionary의 선언과 생성

```swift
// Key가 String 타입이고 Value가 Any인 빈 Dictionary 생성
var anyDictionary: Dictionary<String, Any> = [String: Any]()

// 같은 표현
// var anyDictionary: Dictionary<String, Any> = Dictionary<String, Any>()
// var anyDictionary: Dictionary<String, Any> = [:]
// var anyDictionary: [String: Any] = Dictionary<String, Any>()
// var anyDictionary: [String: Any] = [String: Any]()
// var anyDictionary: [String: Any] = [:]
// var anyDictionary = [String: Any]()
```

##### Dictionary 활용

```swift
// 키에 해당하는 값 할당
anyDictionary["someKey"] = "value"
anyDictionary["anotherKey"] = 100

print(anyDictionary) // ["someKey": "value", "anotherKey": 100]

// 키에 해당하는 값 변경
anyDictionary["someKey"] = "dictionary"
print(anyDictionary) // ["someKey": "dictionary", "anotherKey": 100]

// 키에 해당하는 값 제거
anyDictionary.removeValue(forKey: "anotherKey")
anyDictionary["someKey"] = nil
print(anyDictionary)

// let을 사용하여 Dictionary를 선언하면 불변 Dictionary가 됩니다
let emptyDictionary: [String: String] = [:]
let initalizedDictionary: [String: String] = ["name": "yagom", "gender": "male"]

// 불변 Dictionary이므로 값 변경 불가
//emptyDictionary["key"] = "value"
```

##### Dictionary에서 값 꺼내기

```swift
// "name"이라는 키에 해당하는 값이 없을 수 있으므로 
// String 타입의 값이 나올 것이라는 보장이 없습니다.
// 컴파일 오류가 발생합니다
let someValue: String = initalizedDictionary["name"]
```



#### Set

* 순서가 없고, 멤버가 유일한 컬렉션



##### Set의 선언과 생성

```swift
// 빈 Int Set 생성
var integerSet: Set<Int> = Set<Int>()
integerSet.insert(1)
integerSet.insert(100)
integerSet.insert(99)
integerSet.insert(99)
integerSet.insert(99)

print(integerSet) // [100, 99, 1]
print(integerSet.contains(1)) // true
print(integerSet.contains(2)) // false

integerSet.remove(100)
integerSet.removeFirst()

print(integerSet.count) // 1
```



##### Set과 집합 연산

```swift
// Set은 집합 연산에 유용합니다.
let setA: Set<Int> = [1, 2, 3, 4, 5]
let setB: Set<Int> = [3, 4, 5, 6, 7]

// 합집합
let union: Set<Int> = setA.union(setB)
print(union) // [2, 4, 5, 6, 7, 3, 1]

// 합집합 오름차순 정렬
let sortedUnion: [Int] = union.sorted()
print(sortedUnion) // [1, 2, 3, 4, 5, 6, 7]

// 교집합
let intersection: Set<Int> = setA.intersection(setB)
print(intersection) // [5, 3, 4]

// 차집합
let subtracting: Set<Int> = setA.subtracting(setB)
print(subtracting) // [2, 1]
```



#### 공식 문서

https://developer.apple.com/library/content/documentation/Swift/Conceptual/Swift_Programming_Language/CollectionTypes.html

