NPM_BIN = node_modules/.bin
ROOT = src
ENB = $(NPM_BIN)/enb
BOWER = $(NPM_BIN)/bower

.PHONY: build
build: npm_deps bower_deps config
	$(ENB) make --no-cache

.PHONY: clean
clean: npm_deps
	$(ENB) make clean

.PHONY: config
config:
	if [ $(YENV) == 'production' ]; then \
		cd configs && ln -snf production current; \
    else \
		cd configs && ln -snf dev current; \
	fi;

.PHONY: bower_deps
bower_deps: npm_deps
	$(BOWER) install

.PHONY: npm_deps
npm_deps:
	npm install