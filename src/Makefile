install:
	mkdir -p build
	rm -rf build/*
	cp -R icons popup build
	cp background.js manifest.json build
	npm install
	npm run-script bundle
	rm -rf ../webext-output
	cp -R build ../webext-output
