NPM_BIN = node_modules/.bin
ENB = $(NPM_BIN)/enb
BOWER = $(NPM_BIN)/bower
JSHINT = $(NPM_BIN)/jshint
JSCS = $(NPM_BIN)/jscs
BOWER_NPM_INSTALL = $(NPM_BIN)/bower-npm-install

YENV ?= dev

.PHONY: build
build: npm_deps bower_npm_deps config logs backups cache
	$(ENB) make --no-cache

.PHONY: clean
clean: npm_deps
	$(ENB) make clean

.PHONY: config
config:
	cd configs && ln -snf $(YENV) current
	if [ -f configs/current/borschik ]; then ln -sfn configs/current/borschik .borschik; fi;

.PHONY: logs
logs:
	if [ ! -d logs ]; then mkdir logs; fi;

.PHONY: backups
backups:
	if [ ! -d backups ]; then mkdir backups; fi;

.PHONY: cache
cache:
	if [ ! -d cache ]; then mkdir cache; mkdir cache/branch; mkdir cache/tag; fi;

.PHONY: lint
lint: npm_deps
	$(JSHINT) .
	$(JSCS) .

.PHONY: bower_npm_deps
bower_npm_deps: npm_deps
	$(BOWER_NPM_INSTALL)

.PHONY: npm_deps
npm_deps:
	npm install

.PHONY: data_dev
data_dev:
	cd configs && ln -snf dev current
	node bin/data.js

.PHONY: data_test
data_test:
	cd configs && ln -snf test current
	node bin/data.js

.PHONY: data_prod
data_prod:
	cd configs && ln -snf production current
	node bin/data.js