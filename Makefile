BIN = ./node_modules/.bin

.PHONY: static
static: build
	cd src && ../node_modules/.bin/bem server -p 8001

.PHONY: build
build: data app

.PHONY: app
app: node_modules libs
	cd src && ../node_modules/.bin/bem make desktop.bundles/common
	cd src && ../node_modules/.bin/bem make errors.bundles

.PHONY: libs
libs: node_modules
	if [ ! -d src/libs ] ; then \
        cd src; \
        ../node_modules/.bin/bem make libs; \
	fi;

.PHONY: data
data:
	if [ ! -f datasrc/data.json ] ; then \
        git submodule init; \
        git submodule update; \
        cd datasrc; \
        npm install; \
        ./node_modules/.bin/bem make; \
	fi;

.PHONY: node_modules
node_modules:
	npm install