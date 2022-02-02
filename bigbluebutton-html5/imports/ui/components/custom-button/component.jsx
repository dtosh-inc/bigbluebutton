import React from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames';
import Button from '../button/component';
import BaseButton from '../button/base/component';
import LayoutContext from '../layout/context';
import { styles } from './styles';

const propTypes = {
  /**
   * Defines if the button is active
   * @defaultValue false
   */
  isActive: PropTypes.bool,
};

const defaultProps = {
  isActive: false,
};

export default class CustomButton extends Button {
  render() {
    const { sidebarNavigation } = this.context.layoutContextState.input;

    const {
      className,
      size,
      label,
      isActive,
      ...otherProps
    } = this.props;

    const remainingProps = this._cleanProps(otherProps);

    const textComponent = (
      <span className={styles.label}>{label}</span>
    );

    return (
      sidebarNavigation.isOpen
        ? (
          <Button
            className={cx(className)}
            circle
            size={size}
            label={label}
            hideLabel
            {...otherProps}
          />
        ) : (
          <BaseButton
            className={cx(
              styles[size],
              styles.buttonWrapper,
              styles.customButton,
              !isActive || styles.customButtonActive,
              className,
            )}
            label={label || ''}
            {...remainingProps}
          >
            <span className={cx(this._getClassNames())}>
              {this.renderIcon()}
            </span>
            {textComponent}
          </BaseButton>
        )
    );
  }
}

CustomButton.propTypes = propTypes;
CustomButton.defaultProps = defaultProps;
CustomButton.contextType = LayoutContext;
