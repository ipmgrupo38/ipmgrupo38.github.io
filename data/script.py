import json
data = {}
data2 = []

with open("count_1w.txt", 'r') as fin:
	line = fin.readline()
	while(line):
		a = line.split('\t')
		a[1] = int(a[1].split("\n")[0])

		data2.append(a[0])

		letter = a[0][0]
		if len(a[0]) == 1: 
			line = fin.readline()
			continue
		letter2 = a[0][1]
		if letter not in data:
			data[letter] = {}
		if letter2 not in data[letter]:
			data[letter][letter2] = []
		data[letter][letter2].append(a[0])
		line = fin.readline()
	


with open('count_1w.json', 'w') as outfile:
    json.dump(data, outfile)

with open('count_1w_ord.json', 'w') as ordOutFile:
	json.dump(data2, ordOutFile)