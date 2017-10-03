install:
	mkdir -p build
	rm -rf build/*
	cp -R icons popup wishlist_sidebar build
	cp background.js manifest.json build
	yarn install
	webpack -d
	rm -rf ../webext-output
	cp -R build ../webext-output
