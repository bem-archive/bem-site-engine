NPM_BIN = node_modules/.bin
ENB = $(NPM_BIN)/enb
BOWER = $(NPM_BIN)/bower
JSHINT = $(NPM_BIN)/jshint
JSCS = $(NPM_BIN)/jscs

ifneq ($(YENV),production)
	YENV=dev
endif

.PHONY: build
build: npm_deps bower_deps config logs backups
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

.PHONY: lint
lint: npm_deps
	$(JSHINT) .
	$(JSCS) .

.PHONY: bower_deps
bower_deps: npm_deps
	$(BOWER) install

.PHONY: npm_deps
npm_deps:
	npm install

.PHONY: doc_loader
doc_loader:
	node bin/doc_loader.js