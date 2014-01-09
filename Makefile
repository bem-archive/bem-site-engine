NPM_BIN = node_modules/.bin
ENB = $(NPM_BIN)/enb
BOWER = $(NPM_BIN)/bower

ifneq ($(YENV),production)
	YENV=dev
endif

.PHONY: build
build: npm_deps bower_deps config
	$(ENB) make --no-cache

.PHONY: clean
clean: npm_deps
	$(ENB) make clean

.PHONY: config
config:
	cd configs && ln -snf $(YENV) current
	ln -sfn configs/current/borschik .borschik

.PHONY: bower_deps
bower_deps: npm_deps
	$(BOWER) install

.PHONY: npm_deps
npm_deps:
	npm install
