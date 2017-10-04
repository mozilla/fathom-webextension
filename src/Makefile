all: install

clean:
	mkdir -p build
	rm -rf build
	rm -rf ../webext-output

build: clean
	yarn install
	webpack -d

install: build
	rm -rf ../webext-output
	cp -R build ../webext-output
