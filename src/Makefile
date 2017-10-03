install:
	mkdir -p build
	rm -rf build/*
	yarn install
	webpack -d
	rm -rf ../webext-output
	cp -R build ../webext-output
