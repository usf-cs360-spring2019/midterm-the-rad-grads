import random

def random_sampler(filename, k):
	sample = []
	with open(filename) as f:
		for n, line in enumerate(f):
			if n < k:
				sample.append(line.rstrip())
			else:
				r = random.randint(0, n)
				if r < k:
					sample[r] = line.rstrip()
	return sample

sample = random_sampler("Fire_Department_Calls_for_Service_Filtered_Year_2018.csv", 2500)
f = open("demo.txt","w")
for item in sample:
	print(item)
	f.write(item+"\n")
