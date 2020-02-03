# Pathfinding-visualizer
5th semester web development

## 1.	Część I

###	Opis programu

Pathifinding visualizer jest aplikacją dostępną na przeglądarkę. 
Na ekranie wyświetlane jest menu z wyborem algorytmu oraz siatka interaktywna. 
Program wyznacza najkrótszą drogę (za pomocą wybranego algorytmu), 
z punktu startowego (zielony kwadrat) do końcowego (czerwony kwadrat). 
Użytkownik może tworzyć lub usuwać ściany, które utrudnią wybranemu algorytmowi wyznaczenie drogi. 
Aby stworzyć mur należy kliknąć lewym przyciskiem myszy na puste pole. 
Kliknięcie w wypełnione czarnym kolorem pole spowoduje zniszczenie muru. 
Można budować szybciej przytrzymując przycisk myszy. 
Punkt startowy i docelowy może być przesuwany przez użytkownika poprzez kliknięcie myszą i przeniesienie w wybrane miejsce. 
Analogicznie użytkownik korzystający z urządzenia mobilnego może tworzyć ściany lub przesuwać skrajne punkty dotykając ekranu.

## 2.	Część II

### Specyfikacja techniczna 

#### (a)	Podział projektu na pliki:
-	index.html (70 liń)
-	node.js (21 liń)
-	PriorityQueue.js (53 liń)
-	script.js (513 liń)
-	style_mobile.css (136 liń)
-	styles.css (139 liń)
#### (b) Co znajduje się w danym pliku
#### node.js – klasa jednej komórki siatki 
  Atrybuty:
  -	x
  - y
  -	type = “empty_cell”
  -	gCost = 0
  -	hCost = 0
  -	parent = null
  -	priority = Infinity
  
  Metody: 
  -	fCost()
  -	Equals()

#### PriorityQueue.js  – lista kolejkowa 
-	constructor()
-	enqueue(element)
-	dequeue()
-	front()
-	rear()
-	isEmpty()
-	deleteRear()
-	refresh()

#### script.js – algorytmy oraz rysowanie 
-	init()
-	CreateGrid()
-	BuildWall()
-	SetStartTarget()
-	IdToNode()
-	NodeToId()
-	Distance()
-	Neighbours(n)
-	LowestFCost(nodes)
-	AStar()
-	Clear()
-	DrawPath()
-	ColorNode(node, type)
-	Visualize()
-	Dijkstra()
-	resetNodes()
-	CreateGridForPhones()
-	dragStart()
-	dragEnd()
-	drag()
-	Sleep(ms)
-	asyncForEach(array, callback)

#### Index.html – podział strony 

#### style_mobile.css – styl strony na urządzenia mobilne 

#### styles.css – styl strony 

###	Szczegóły techniczne

#### a)	Algorytmy/fragmenty kodu

Do znalezienia najkrótszej ścieżki wykorzystaliśmy następujące algorytmy: 
- A* opisany przez Petera Harta, Nilsa Nilssona oraz Bertrama Raphaela.
-	Dijsktra opracowany przez holenderskiego informatyka Edsgera Dijkstrę

