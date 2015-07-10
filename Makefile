
## rm command
RM ?= rm -f

## duo command
DUO := node_modules/.bin/duo

## npm command
NPM ?= npm

## uglifyjs command
UGLIFY := node_modules/.bin/uglifyjs

## main entry point
MAIN ?= index.js
## source files
SRC := $(MAIN) component.json

## duo command flags
DUOFLAGS += -C --stdout --type js

## uglify command flags
UGLIFYFLAGS += --compress --mangle

## dist target file name
DIST_TARGET ?= dist/lsplayer-iframe-sdk.js

## ensures parent directory of target is built
define BUILD_PARENT_DIRECTORY
	mkdir -p $(dir $@)
endef

## default target
default: build dist

## build target
build: build/build.js

## dist target
dist: $(DIST_TARGET)

## builds dist target soruce
$(DIST_TARGET): $(SRC)
	$(BUILD_PARENT_DIRECTORY)
	$(DUO) $(DUOFLAGS) $(MAIN) > $(@)
ifndef DEBUG
	$(UGLIFY) $(UGLIFYFLAGS) -o $(@) -- $(@)
endif

## javascript build file target
build/build.js: $(SRC)
	$(BUILD_PARENT_DIRECTORY)
	$(DUO) $(DUOFLAGS) -d $(MAIN) > $(@)

## builds node_modules
node_modules: package.json
	$(NPM) install

## ensures source dependencies are built
$(SRC): node_modules

## cleans build, node_modules, and components
.PHONY: clean
clean:
	$(RM) -r build
	$(RM) -r components
	$(RM) -r node_modules

