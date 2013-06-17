NPM ?= npm

NPM_BIN := $(shell $(NPM) bin)

NPM_DEPS := $(shell node -pe "Object.keys(require('./package.json').dependencies).join(' ')")
NPM_DEPS_PATHS := $(addprefix node_modules/,$(NPM_DEPS))

SOURCES := \
	islands-components \
	islands-icons \
	islands-media \
	islands-page \
	islands-promo \
	islands-services \
	islands-user
#	islands-search \
#	islands-core
SOURCES_PATHS := $(addprefix _,$(SOURCES))

with_npm_registry_flag:=--registry http://npm.yandex-team.ru
do_npm = $(NPM) $(with_npm_registry_flag) $(1) $(2) $(3) $(4) $(5)

all:: build

build:: deps sources

deps:: $(NPM_DEPS_PATHS)

$(NPM_DEPS_PATHS):: node_modules

node_modules::
	$(call do_npm,install)

sources:: $(SOURCES_PATHS)

$(SOURCES_PATHS):: cache

cache $(SOURCES_PATHS)::
	$(info ===> Building "$@")
	$(NPM_BIN)/bem make -w 16 $@

clean::
	$(RM) -r ./.bem/cache*
	$(RM) -r $(SOURCES_PATHS)
	$(call do_npm,prune)
	$(call do_npm,uninstall,$(NPM_DEPS))

.PHONY: all build deps sources cache clean

